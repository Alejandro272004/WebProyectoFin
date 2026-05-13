import { auth, db } from './config.js';
import { collection, addDoc, doc, updateDoc, increment, getDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const transferForm = document.getElementById('transfer-form');

if (transferForm) {
    transferForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const destinatarioIban = document.getElementById('destinatario').value;
        const monto = parseFloat(document.getElementById('monto').value);
        const concepto = document.getElementById('concepto').value;
        const user = auth.currentUser;

        if (!user) return;

        try {
            // 1. Obtener datos del remitente
            const userRef = doc(db, "usuarios", user.uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();

            if (userData.saldo < monto) {
                Swal.fire('Saldo insuficiente', 'No tienes suficiente dinero para esta transferencia.', 'error');
                return;
            }

            // 2. Buscar al destinatario por IBAN
            const q = query(collection(db, "usuarios"), where("iban", "==", destinatarioIban));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                Swal.fire('Error', 'El IBAN del destinatario no existe.', 'error');
                return;
            }

            const destinatarioDoc = querySnapshot.docs[0];
            const destinatarioRef = doc(db, "usuarios", destinatarioDoc.id);

            // 3. Realizar la transferencia (Atómico o secuencial simplificado)
            await updateDoc(userRef, {
                saldo: increment(-monto)
            });

            await updateDoc(destinatarioRef, {
                saldo: increment(monto)
            });

            // 4. Registrar movimiento
            await addDoc(collection(db, "movimientos"), {
                userId: user.uid,
                tipo: 'transferencia_enviada',
                monto: -monto,
                concepto: concepto,
                destinatario: destinatarioIban,
                fecha: new Date()
            });

            await addDoc(collection(db, "movimientos"), {
                userId: destinatarioDoc.id,
                tipo: 'transferencia_recibida',
                monto: monto,
                concepto: concepto,
                remitente: userData.nombre,
                fecha: new Date()
            });

            Swal.fire('¡Éxito!', 'Transferencia realizada correctamente.', 'success');
            transferForm.reset();

        } catch (error) {
            console.error("Error en transferencia:", error);
            Swal.fire('Error', 'Hubo un problema al procesar la transferencia.', 'error');
        }
    });
}