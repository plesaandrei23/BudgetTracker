# 💰 Budget Pro - Student Finance Tracker

Budget Pro este o aplicație web modernă, optimizată pentru mobil (PWA), care ajută studenții să își monitorizeze veniturile și cheltuielile în timp real. Construită pentru simplitate și viteză, funcționează direct în browser dar se comportă ca o aplicație nativă.

![Status](https://img.shields.io/badge/Status-Live-green) ![Tech](https://img.shields.io/badge/Tech-HTML%20%7C%20Tailwind%20%7C%20Firebase-blue)

## 🔗 Demo Live
Accesează aplicația aici: **[Link-ul Tău GitHub Pages Aici]**
*(Exemplu: https://plesaandrei23.github.io/BudgetTracker/)*

---

## ✨ Funcționalități Curente (v2.0 - Revolut Style Overhaul)

### 📱 Experiență Utilizator Premium
* **Single Page Application (SPA):** Navigare instantanee fără reîncărcarea paginii.
* **UI Modern & Dark Mode:** Design inspirat de Revolut, cu carduri "glassmorphism", culori vibrante (Slate/Blue/Emerald) și iconițe intuitive.
* **Mobile First:** Optimizat perfect pentru telefoane, cu bară de navigare fixă jos și layout ergonomic.

### 💸 Management Financiar Avansat
* **Conturi Multiple:** Suport pentru Cash, BT Personal, Revolut, Business (PFA) și Business Cash.
* **Logică de Business:** Calcul automat al "Tip Amount" pentru veniturile PFA și separarea banilor de business vs personali.
* **Transferuri:** Funcție dedicată pentru a muta bani între conturi (ex: Top-up Revolut din BT).
* **Tranzacții Inteligente:** Recunoaștere automată a tipului (Venit/Cheltuială/Transfer) și colorare specifică.

### 📊 Analiză & Statistici (Redesign Complet)
* **Navigare în Timp:** Vezi cheltuielile pe Săptămână (Week), Lună (Month) sau An (Year) cu butoane de navigare (< >).
* **Grafice Interactive:**
    * **Week View:** Grafic cu bare zilnice (Luni-Duminică).
    * **Month View:** Grafic cu bare săptămânale (W1-W5).
    * **Year View:** Grafic lunar (Ian-Dec).
* **Breakdown Detaliat:** Lista cheltuielilor pe categorii cu bare de progres procentuale.
* **Insigne Vizuale:** Carduri "Net Worth" și "Procent Cheltuit" animate.

### 🎯 Goals (În Lucru)
* **Placeholder:** Secțiune nouă în meniu pentru setarea obiectivelor financiare și alocarea economiilor (Coming Soon).

### 🛡️ Date & Import/Export
* **Backup JSON:** Exportă toate datele într-un fișier local pentru siguranță.
* **Import Inteligent:** Importă date din backup, cu detecția duplicatelor și validare.

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
