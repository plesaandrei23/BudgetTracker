# 💰 Budget Pro - Student Finance Tracker

Budget Pro este o aplicație web modernă, optimizată pentru mobil (PWA), care ajută studenții să își monitorizeze veniturile și cheltuielile în timp real. Construită pentru simplitate și viteză, funcționează direct în browser dar se comportă ca o aplicație nativă.

![Status](https://img.shields.io/badge/Status-Live-green) ![Tech](https://img.shields.io/badge/Tech-HTML%20%7C%20Tailwind%20%7C%20Firebase-blue)

## 🔗 Demo Live
Accesează aplicația aici: **[Link-ul Tău GitHub Pages Aici]**
*(Exemplu: https://plesaandrei23.github.io/BudgetTracker/)*

---

## ✨ Funcționalități Curente

### 📱 Experiență Utilizator
* **Design Responsive:** Interfață hibridă care arată ca un telefon pe Desktop și ocupă tot ecranul pe Mobil.
* **Add to Home Screen:** Poate fi instalată ca o aplicație pe iOS și Android (fără App Store).
* **Dark Mode UI:** Design modern "Slate & Blue" prietenos cu ochii.

### 💸 Management Financiar
* **Sincronizare Cloud:** Toate datele sunt salvate instantaneu în Google Firebase. Poți accesa bugetul de pe telefon, laptop sau tabletă simultan.
* **Autentificare Google:** Login rapid și sigur cu contul tău Google.
* **Adăugare Rapidă:** Formular simplificat pentru tranzacții (Cash sau Card).
* **Editare & Ștergere:** Ai greșit suma? Poți edita sau șterge orice tranzacție oricând.

### 📊 Analiză & Organizare
* **Dashboard:** Balanță totală, total venituri și total cheltuieli la vedere.
* **Grafic Vizual:** Diagramă tip "Doughnut" (Chart.js) pentru a vedea pe ce se duc banii.
* **Categorii Personalizate:** Poți adăuga propriile categorii (ex: "Netflix", "Shaorma", "Bursa") din meniul de Setări.

### 🛡️ Siguranță & Date
* **Backup Hibrid:** Funcție de Export/Import JSON pentru a salva datele local, independent de Cloud.

---

## 🚀 Cum se folosește (Ghid Utilizator)

### 1. Instalare pe Telefon
Nu trebuie să descarci nimic din App Store.
* **iOS (iPhone):** Deschide link-ul în Safari → Apasă butonul **Share** (pătratul cu săgeată) → Alege **"Add to Home Screen"**.
* **Android:** Deschide link-ul în Chrome → Apasă meniul (3 puncte) → Alege **"Install App"** sau **"Add to Home Screen"**.

### 2. Adăugare Tranzacții
1.  Selectează tipul: **Cheltuială** (Roșu) sau **Venit** (Gri).
2.  Alege data (implicit este azi).
3.  Introdu suma și alege categoria.
4.  Apasă **Salvează**.

### 3. Modificare Categorii
1.  Apasă iconița de **Setări** (⚙️) din dreapta sus.
2.  Scrie numele noii categorii (ex: "Taxi").
3.  Apasă butonul **+**.
4.  Categoria va apărea acum în lista principală.

### 4. Editarea unei tranzacții
Apasă pe iconița **Creion** (✏️) din dreptul oricărei tranzacții din listă. Datele se vor încărca în formularul de sus. Modifică și apasă **Actualizează**.

---

## 🛠️ Configurare pentru Developeri

Dacă vrei să clonezi acest proiect, ai nevoie de propriul cont Firebase.

1.  Clonează repo-ul:
    ```bash
    git clone [https://github.com/plesaandrei23/BudgetTracker.git](https://github.com/plesaandrei23/BudgetTracker.git)
    ```
2.  Creează un proiect în [Firebase Console](https://console.firebase.google.com/).
3.  Activează **Authentication** (Google Provider) și **Firestore Database**.
4.  În `index.html`, înlocuiește obiectul `firebaseConfig` cu datele tale:
    ```javascript
    const firebaseConfig = {
        apiKey: "CHEIA_TA",
        authDomain: "PROIECTUL_TAU.firebaseapp.com",
        projectId: "PROIECTUL_TAU",
        // ...
    };
    ```

---

## 🗺️ Roadmap & Future Features

Planurile pentru dezvoltarea viitoare a aplicației:

### 🔜 Prioritate Ridicată
- [ ] **Filtrare Avansată a Perioadei:** Opțiunea de a vedea cheltuielile doar pentru: *Această Săptămână, Această Lună, Acest An* sau *Interval Personalizat*.
- [ ] **Native App Support:** Împachetarea aplicației folosind **Capacitor** sau **React Native** pentru a o publica oficial pe App Store și Google Play.

### 💡 Sugestii & Idei Noi
- [ ] **Cheltuieli Recurente (Abonamente):** Posibilitatea de a marca o cheltuială ca "Lunar" (ex: Spotify, Chirie) pentru a se adăuga singură.
- [ ] **Bugete Limită (Budgets):** Setarea unei limite (ex: "Maxim 500 lei pe Mâncare") și alerte vizuale când te apropii de limită.
- [ ] **Export CSV/Excel:** Pentru studenții care vor să își facă analize complexe în Excel.
- [ ] **Mod Offline:** Îmbunătățirea "Service Worker"-ului pentru a permite adăugarea de cheltuieli chiar și fără internet (sincronizare când revine semnalul).

---

## 📄 Licență
Acest proiect este open-source și disponibil pentru uz personal.
