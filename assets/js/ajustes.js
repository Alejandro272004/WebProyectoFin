import { auth, db } from '../../../assets/js/config.js';
import { doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const settingName = document.getElementById('setting-name');
const btnSave = document.querySelector('.settings-form button');

onAuthStateChanged(auth, async (user) => {
    if (user && settingName) {
        const userRef = doc(db, "usuarios", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            settingName.value = userSnap.data().nombre;
        }
    }
});

if (btnSave) {
    btnSave.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (user && settingName.value) {
            try {
                await updateDoc(doc(db, "usuarios", user.uid), {
                    nombre: settingName.value
                });
                Swal.fire('Actualizado', 'Tu nombre ha sido actualizado correctamente.', 'success');
            } catch (e) {
                Swal.fire('Error', 'No se pudieron guardar los cambios.', 'error');
            }
        }
    });
}