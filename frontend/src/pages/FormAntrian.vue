
<template>
    <main class="bp3mi-page">

        <section class="relative bp3mi-card max-w-5xl w-full">
            <header  class="text-center space-y-2 mb-4" >
                <h1 class="bp3mi-subtitle">BP3MI</h1>
                <p class="bp3mi-title">Form Antrian</p>
            </header>
            <form class="space-y-6" @submit.prevent="handleSubmit">
                <fieldset class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- NAMA -->
                    <BaseInput
                        label="Nama Lengkap"
                        placeholder="Masukkan nama lengkap"
                        v-model="form.nama"
                        required
                    />

                    <!-- JK -->
                    <BaseSelect
                        label="Jenis Kelamin"
                        placeholder="-- Pilih Jenis Kelamin --"
                        :options="jkOptions"
                        v-model="form.jk"
                        required
                    />
                    <!-- PROVINSI -->

                     <BaseSelect
                        label="Provinsi"
                        placeholder="-- Pilih Provinsi --"
                        :options="provinsiOptions"
                        v-model="form.provinsi"
                        required
                    />

                    <!-- KABUPATEN -->
                    <BaseSelect
                        label="Kabupaten"
                        placeholder="-- Pilih Kabuaten --"
                        :options="kabupatenOptions"
                        v-model="form.kabupaten"
                        :disabled="!form.provinsi"
                        required
                    />
                    

                    <!-- ALAMAT -->
                    <BaseInput
                        label="Alamat"
                        placeholder="Masukkan Alamat Lengkap"
                        v-model="form.alamat"
                        required
                    />

                    <!-- PASPOR -->
                    <BaseInput
                        label="Paspor"
                        placeholder="Masukkan Paspor"
                        v-model="form.paspor"
                        maxlength="9"
                        required
                    />

                    <!-- NEGARA -->
                    <BaseAutoComplete
                        label="Negara"
                        placeholder="Pilih Negara"
                        :items="dataNegara"
                        v-model="form.negara"
                    />

                    <BaseAutoComplete
                        label="Sektor"
                        placeholder="Pilih Sektor Pekerjaan"
                        :items="dataSektor"
                        v-model="form.sektor"
                    />


                    <!-- PERUSAHAAN -->
                    <BaseInput
                        label="Perusahaan"
                        placeholder="Masukkan nama perusahaan"
                        v-model="form.perusahaan"
                        required
                    />

                    <!-- PENDIDIKAN -->
                    <BaseSelect
                        label="Pendidikan"
                        placeholder="-- Pendidikan Terakhir --"
                        :options="pendidikanOptions"
                        v-model="form.pendidikan"
                        required
                    />

                    <!-- TGL -->
                    <BaseInput
                        label="Tanggal OPP"
                        type="date"
                        v-model="form.tgl"
                        required
                    />


                    <!-- NO HP -->
                    <BaseInput
                        label="Nomor HP"
                        placeholder="Masukkan Nomor HP"
                        v-model="form.hp"
                        required
                    />


                    <!-- SKEMA -->
                    <BaseSelect
                        label="Skema"
                        placeholder="-- Pilih Skema --"
                        :options="skemaOptions"
                        v-model="form.skema"
                        required
                    />
                </fieldset>
                <button class="bp3mi-button" type="submit" :disabled="isLoading">
                    {{ isLoading ? "Memproses..." : "Ambil Antrian" }}
                </button>

            </form>
        </section>
    </main>
</template>

<script setup>

import { ref, onMounted,computed, watch } from 'vue';
import { useRouter } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseAutoComplete from '@/components/ui/BaseAutoComplete.vue'
const router = useRouter()



const jkOptions =[
    {
        label: "Laki-Laki",
        value: "L"
    },
    {
        label: "Perempuan",
        value: "P"
    }
]

const provinsiOptions = [
    {
        label: "Lampung",
        value: "Lampung"
    }
]

// DATA WILAYAH
const dataWilayah = {
    Lampung: [
        "Lampung Barat", "Lampung Selatan", "Lampung Tengah",
        "Lampung Timur", "Lampung Utara", "Mesuji",
        "Pesawaran", "Pesisir Barat", "Pringsewu",
        "Tanggamus", "Tulang Bawang", "Tulang Bawang Barat",
        "Way Kanan", "Bandar Lampung", "Metro"
    ]
};

const kabupatenOptions = ref([]);

const pendidikanOptions = [
    {
        label: "SMA Sederajat",
        value: "SMA Sederajat"
    },
    {
        label: "D1",
        value: "D1"
    },
    {
        label: "D2",
        value: "D2"
    },
    {
        label: "D3",
        value: "D3"
    },
    {
        label: "D4",
        value: "D4"
    },
    {
        label: "S1",
        value: "S1"
    },
    {
        label: "S2",
        value: "S2"
    },
    {
        label: "S3",
        value: "S3"
    }
]

const skemaOptions = [
    {
        label: "SSW Mandiri",
        value: "SSW Mandiri"
    },
    {
        label: "Mandiri",
        value: "Mandiri"
    },
    {
        label: "Cuti",
        value: "Cuti"
    }
]
const form = ref({
    nama: "",
    jk: "",
    provinsi: "",
    kabupaten: "",
    alamat: "",
    paspor: "",
    negara: "",
    sektor: "",
    perusahaan: "",
    pendidikan: "",
    tgl: "",
    hp: "",
    skema: ""
});

watch(
  () => form.value.provinsi,
  () => {
    handleProvinsi()
  }
)

const isLoading = ref(false)

// SUBMIT
const handleSubmit = async () => {


    // VALIDASI SIMPLE
    for (let key in form.value) {
        if (!form.value[key]) {
            alert("Semua field wajib diisi");
            return;
        }
    }
    if (!dataNegara.value.includes(form.value.negara)) {
        alert("Pilih negara dari daftar!");
        return;
    }

    if (!dataSektor.value.includes(form.value.sektor)) {
        alert("Pilih sektor dari daftar!");
        return;
    }


    if (isLoading.value) return



    // loading state
    if (isLoading.value) return
    isLoading.value = true

    try {
        const res = await fetch("http://localhost:3000/antrian", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(form.value)
        });

        const result = await res.json();
        if (!res.ok) {
            alert(result.message || "Terjadi kesalahan");
            return;
        }

        if (!result.data?.nomor) {
            alert("Nomor antrian tidak ditemukan!");
            return;
        }

        if (!result.success) {
            alert(result.message);
            return;
        }
        router.push(`/hasil?nomor=${result.data.nomor}&nama=${form.value.nama}&tgl=${form.value.tgl}`)

    } catch (err) {
        alert("Server error");
    } finally {
        isLoading.value = false
    }
};



// NEGARA

// set up negara
const dataNegara = ref([])

// api negara
onMounted(async () => {
    const res = await fetch("https://restcountries.com/v3.1/all?fields=name")
    const data = await res.json()

    dataNegara.value = data
        .map(c => c.name.common)
        .sort((a, b) => a.localeCompare(b))
})

// SEKTOR 

// set up sektor
const dataSektor = ref([
    "Factory Operator",
    "Plantation Worker",
    "Construction Worker",
    "Domestic Helper",
    "Caregiver",
    "Elderly Caregiver",
    "Shipyard Laborer",
    "Manufacturing Staff",
    "Service Crew",
    "General Laborer",
    "Spa Therapist",
    "Message Therapist",
    "Beauty Technician",
    "Driver",
    "Hotel Housekeeper",
    "Software Engineer",
    "Costumer Service BPO",
    "Accountant",
    "IT Consultant",
    "Hospitality Manager",
    "English Tutor",
    "Regitered Nurse",
    "Data Analyst",
    "Petroleum Engineer",
    "Medical Doctor",
    "Heavy Equipment Mechanic",
    "Guest Realtions Officer",
    "Executive Chef",
    "Sales Manager",
    "Quanity Surveyor",
    "Architect",
    "Nursing Care",
    "Building Cleaning",
    "Agriculture",
    "Food and Beverages Manufacturing",
    "Food Service Industry",
    "Constucction",
    "Shipbuilding and Ship Machinery",
    "Accomodation Industry",
    "Automobile Industry",
    "Automobile Maintenance",
    "Aviation",
    "Machine Parts and Tooling",
    "Industrial Machinery Manufacturing",
    "Electric, Electronics and Infromation",
    "Fishery and Aquaculture",

])



// validasi data
const validateNegara = () => {
    if (!dataNegara.value.includes(form.value.negara)) {
        form.value.negara = ''
    }
}

const validateSektor = () => {
    if (!dataSektor.value.includes(form.value.sektor)) {
        form.value.sektor = ''
    }
}


// HANDLE PROVINSI
const handleProvinsi = () => {
    kabupatenOptions.value =
        (dataWilayah[form.value.provinsi] || [])
            .map(item => ({
                label: item,
                value: item
            }))
    form.value.kabupaten = ""
};








</script>
