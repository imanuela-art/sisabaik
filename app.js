"use strict";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
});

document.addEventListener("DOMContentLoaded", () => {
    siapkanKatalog();
    siapkanValidasiPenawaran();
});

async function siapkanKatalog() {
    const wadah = document.querySelector("#daftar-penawaran");

    if (!wadah) return;

    const status = document.querySelector("#status-katalog");
    const inputCari = document.querySelector("#kata-kunci");
    const pilihKategori = document.querySelector("#filter-kategori");
    const keranjang = [];

try {
    const response = await fetch("data/penawaran.json");
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const penawaran = await response.json();
    function perbaruiTampilan() {
        const kata = inputCari.value.trim().toLowerCase();
        const kategori = pilihKategori.value;

        const hasil = penawaran.filter((item) => {
            const cocokKata = `${item.nama} ${item.penyedia}`
                .toLowerCase()
                .includes(kata);

                const cocokKategori = kategori === "semua" || item.kategori === kategori;
                return cocokKata && cocokKategori;
        });

        renderKartu(hasil, wadah, status, keranjang);
    }

    inputCari.addEventListener("input", perbaruiTampilan);
    pilihKategori.addEventListener("change", perbaruiTampilan);

    perbaruiTampilan();

} catch (error) {
    status.textContent= "Data penawaran gagal dimuat.";
    status.classList.add("error-message");
    console.error(error);
    }
}

function renderKartu(data, wadah, status, keranjang) {
    wadah.replaceChildren();

    status.textContent = `${data.length} penawaran ditemukan.`;

    data.forEach((item) => {
        const kartu = document.createElement("article");
        kartu.className = "offer-card";

        kartu.innerHTML = `
        <div class="offer-card__visual" aria-hidden="true"></div>

        <div class="offer-card__content">
        <span class="badge">${item.labelKategori}</span>
        <h3>${item.nama}</h3>
        <p class="offer-card__meta">
        ${item.penyedia} · ${item.stok} ${item.satuan}
        </p>
        
        <p>
        <span class="price-normal">
        ${rupiah.format(item.hargaNormal)}
        </span>

        <strong class="price-offer">
        ${
            item.hargaPenawaran === 0
                ? "Tanpa biaya"
                : rupiah.format(item.hargaPenawaran)
        }
        </strong>
        </p>
                <button
                class="button button--primary"
                type="button"
                data-id="${item.id}"
                >
                Tambah
                </button>
        </div>
        `;  

        const tombolTambah = kartu.querySelector("[data-id]");

        tombolTambah.addEventListener("click", () => {
            keranjang.push(item);
            perbaruiRingkasan(keranjang);
        });

        wadah.append(kartu);
    });
    }

function perbaruiRingkasan(keranjang) {
    const total = keranjang.reduce(
        (jumlah, item) => jumlah + item.hargaPenawaran, 0
    );

    document.querySelector("#jumlah-item").textContent = keranjang.length;
    document.querySelector("#total-pesanan").textContent = rupiah.format(total);
}

function siapkanValidasiPenawaran() {
    const form = document.querySelector("#form-penawaran");
    if (!form) return;
    const hargaNormal = document.querySelector("#harga-normal");
    const hargaPemulihan = document.querySelector("#harga-pemulihan");

function validasiHarga() {
    const normal = Number(hargaNormal.value);
    const pemulihan = Number(hargaPemulihan.value);

    if (pemulihan > normal) {
        hargaPemulihan.setCustomValidity(
            "Harga pemulihan tidak boleh melebihi harga normal."
        );
    } else {
        hargaPemulihan.setCustomValidity("");
    }
}

hargaNormal.addEventListener("input", validasiHarga);
hargaPemulihan.addEventListener("input", validasiHarga);

form.addEventListener("submit", (event) =>  {
    validasiHarga();

    if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
    }
});
}
