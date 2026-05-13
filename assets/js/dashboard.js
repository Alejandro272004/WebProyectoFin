import { auth, db } from './config.js';
import { collection, query, where, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const transactionsList = document.getElementById('transactions-list');

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Cargar los últimos 5 movimientos
        const q = query(
            collection(db, "movimientos"),
            where("userId", "==", user.uid),
            orderBy("fecha", "desc"),
            limit(5)
        );

        onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                transactionsList.innerHTML = '<p class="empty-msg">No hay movimientos recientes.</p>';
                return;
            }

            transactionsList.innerHTML = '';
            snapshot.forEach((doc) => {
                const mov = doc.data();
                const fecha = mov.fecha.toDate().toLocaleDateString();
                const item = document.createElement('div');
                item.className = 'transaction-item';
                item.innerHTML = `
                    <div class="trans-info">
                        <strong>${mov.concepto || 'Sin concepto'}</strong>
                        <span>${fecha}</span>
                    </div>
                    <div class="trans-amount ${mov.monto > 0 ? 'positive' : 'negative'}">
                        ${mov.monto > 0 ? '+' : ''}${mov.monto.toFixed(2)}€
                    </div>
                `;
                transactionsList.appendChild(item);
            });
        });
    }
});