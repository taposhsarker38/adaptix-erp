# Adaptix User Manual

Welcome to the Adaptix ERP/POS User Manual. This document provides step-by-step instructions and technical details for managing your business operations.

---

## 📦 Inventory Module (মজুদ ব্যবস্থাপনা)

The Inventory module is a powerful multi-location stock management system designed for scalability and precision.

### ১. মূল ধারণা (Overview)

Eiti apnar business-er bibhinno physical location-e (Warehouse, Store, ba Go-down) koto tuku mal (stock) ache seta track kore. Eiti manually stock adjust kora theke shuru kore, automatic low-stock alert deya porjonto sob kichu handle kore.

---

### ২. ব্যাকেন্ড আর্কিটেকচার (Back-office Logic)

Inventory system-er pichone kichu mul model kaj kore:

- **Warehouse**: Apnar business-er protiti store ba storage location-ke eikhane register kora hoy.
- **Stock Model**: Eiti apnar Product Service-er sathe Warehouse-er link toiri kore. Jemon: "Product A" "Warehouse 1"-e koto tuku ache.
- **Transactions**: Stock-er joto poriborton hoy (Kena, Bikri, ba Transfer), tar ekti full audit trail ba history eikhane thake.
- **Batch & Expiry Tracking**: Jader Medicine ba Food business, tader jonno eikhane Batch Number ebong Expiry Date track korar sujog ache.
- **Serial Number Tracking**: Electronics ba Mobile business-er jonno IMEI ba Serial Number track kora jay.
- **BOM (Bill of Materials)**: Ekti product toiri korte ki ki kacha-mal (raw materials) lage seta auto-deduct korar logic eikhane ache.

---

### ৩. ফ্রন্টেন্ড ইন্টারফেস (Frontend Workflow)

Apni jokhon `dashboard/inventory/` link-e jaben, tokhon eikhane mukhoto duti tab dekhben:

#### **A. Stock Overview (মজুদ পর্যালোচনা)**

- **Real-time Levels**: Eikhane sob product-er current stock level dekha jay.
- **Warehouse Filters**: Apni chaile specific kono warehouse-er stock switch kore dekhte paren.
- **Quick Adjustments**: Eikhane ekti specialized feature ache jate apna-ke bar bar form fill-up korte hobe na. Apni sorasori list theke stock level update korte parben.
- **Smart Search & Scanner**: `Cmd+K` shortcut-er maddhome apni SKU scan kore ba product search kore druto stock find korte paren.

#### **B. Warehouses (গুদাম ব্যবস্থাপনা)**

- Eikhane apni nuton warehouse add kora ba purono-gulo edit korar kaj korte parben.

---

### ৪. স্মার্ট এবং অটোমেটেড ফিচারস (Advanced Features)

- **Low Stock Alert**: Protiti product-er jonno ekti "Reorder Level" thake. Stock oi level-er niche gele system automatic notification pathay.
- **UOM Conversion**: Jemon apni hoyto product "Box" hisebe kinlen kintu "Pcs" hisebe bikri korchen. System eita automatic convert kore stock calculation thik rakhe.
- **Multi-Tenant Isolation**: Protiti company-r inventory data purnongo-vabe alada thake, fole ekti branch-er data onyo branch-e mix hoy na.

---

### সারাংশ (Summary Workflow)

1.  **Step 1**: Prothome **Warehouse** toiri kora hoy.
2.  **Step 2**: **Product Service** theke product-er link niye stock initial record toiri hoy.
3.  **Step 3**: **Transactions** (Sale/Purchase)-er maddhome stock auto-update hoy.
4.  **Step 4**: Apni **Inventory Hub** theke sob kichu monitor koren ebong proyojone **Manual Adjustment** koren.
