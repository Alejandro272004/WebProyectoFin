import { auth, db } from './config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const userNameDisplay = document.getElementById('user-name');
const userBalanceDisplay = document.getElementById('user-balance');
const btnLogout = document.getElementById('btn-logout');

// 1. Verificar si hay un usuario conectado
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Escuchar datos del usuario en tiempo real
        if (userNameDisplay || userBalanceDisplay) {
            onSnapshot(doc(db, "usuarios", user.uid), (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    if (userNameDisplay) userNameDisplay.innerText = data.nombre;
                    if (userBalanceDisplay) userBalanceDisplay.innerText = `${data.saldo.toFixed(2)}€`;
                }
            });
        }
    } else {
        // Si no hay usuario, mandarlo al login
        window.location.href = 'index.html';
    }
});

// 2. Cerrar Sesión con SweetAlert
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        Swal.fire({
            title: '¿Cerrar sesión?',
            text: "Tendrás que volver a entrar para ver tus datos.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1a2a6c',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                signOut(auth).then(() => {
                    window.location.href = 'index.html';
                });
            }
        });
    });
}