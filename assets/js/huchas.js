import { auth, db } from './config.js';
import { collection, addDoc, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const huchasGrid = document.querySelector('.huchas-grid');
const addHuchaCard = document.querySelector('.add-hucha-card');

if (addHuchaCard) {
    addHuchaCard.addEventListener('click', async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Nueva Hucha de Ahorro',
            html:
                '<input id="hucha-nombre" class="swal2-input" placeholder="Nombre (ej. Coche)">' +
                '<input id="hucha-meta" type="number" class="swal2-input" placeholder="Meta (€)">',
            focusConfirm: false,
            preConfirm: () => {
                return [
                    document.getElementById('hucha-nombre').value,
                    document.getElementById('hucha-meta').value
                ]
            }
        });

        if (formValues && formValues[0] && formValues[1]) {
            try {
                await addDoc(collection(db, "huchas"), {
                    userId: auth.currentUser.uid,
                    nombre: formValues[0],
                    meta: parseFloat(formValues[1]),
                    ahorrado: 0,
                    fechaCreacion: new Date()
                });
                Swal.fire('¡Creada!', 'Tu hucha ha sido creada.', 'success');
            } catch (e) {
                Swal.fire('Error', 'No se pudo crear la hucha.', 'error');
            }
        }
    });
}

// Cargar huchas en tiempo real
if (huchasGrid) {
    const user = auth.currentUser;
    // Nota: auth.currentUser puede ser null al cargar el script, main.js maneja la redirección
    // Pero onAuthStateChanged es mejor para asegurar el acceso al UID
    import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
    
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const q = query(collection(db, "huchas"), where("userId", "==", user.uid));
            onSnapshot(q, (snapshot) => {
                // Limpiar grid excepto el botón de añadir
                const cards = huchasGrid.querySelectorAll('.hucha-item');
                cards.forEach(c => c.remove());

                snapshot.forEach((doc) => {
                    const hucha = doc.data();
                    const progress = (hucha.ahorrado / hucha.meta) * 100;
                    
                    const div = document.createElement('div');
                    div.className = 'hucha-item credit-card-item'; // Reusando estilos o definiendo nuevos
                    div.innerHTML = `
                        <h4>${hucha.nombre}</h4>
                        <p>${hucha.ahorrado}€ / ${hucha.meta}€</p>
                        <div class="progress-bar"><div style="width: ${progress}%"></div></div>
                    `;
                    huchasGrid.insertBefore(div, addHuchaCard);
                });
            });
        }
    });
}