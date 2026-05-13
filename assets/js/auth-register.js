import { auth, db } from '../../../assets/js/config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const registerForm = document.getElementById('register-form');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('reg-nombre').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        // --- VALIDACIÓN: Mayúscula, minúscula, número, símbolo y min. 8 caracteres ---
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!strongPasswordRegex.test(password)) {
            Swal.fire({
                icon: 'warning',
                title: 'Contraseña poco segura',
                text: 'Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.',
                confirmButtonColor: '#1a2a6c'
            });
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Guardar en Firestore
            await setDoc(doc(db, "usuarios", user.uid), {
                nombre: nombre,
                email: email,
                saldo: 0,
                fechaCreacion: new Date()
            });

            Swal.fire({
                icon: 'success',
                title: '¡Cuenta creada!',
                text: 'Bienvenido a BankFlow.',
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                window.location.href = 'dashboard.html';
            });

        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                Swal.fire({
                    icon: 'error',
                    title: 'Email registrado',
                    text: 'Este correo ya está en uso. Prueba con otro o inicia sesión.',
                    confirmButtonColor: '#1a2a6c'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Hubo un problema',
                    text: error.message
                });
            }
        }
    });
}