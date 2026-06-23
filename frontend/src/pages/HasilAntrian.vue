<template>

  <main class="bp3mi-page">

    <section class="bp3mi-card max-w-xl w-full space-y-8">

      <header class="text-center space-y-2">

        <p class="bp3mi-subtitle">
          BP3MI
        </p>

        <h1 class="bp3mi-title">
          Antrian Berhasil
        </h1>

      </header>

      <article class="space-y-4">
        <div class="grid gap-4">

          <div class="bp3mi-result-item">
            <span>Nomor Antrian</span>
            <strong class="bp3mi-queue-number">
              {{ route.query.nomor }}
            </strong>
          </div>

          <div class="bp3mi-result-item">
            <span>Nama</span>
            <strong class="bp3mi-queue-number">
              {{ route.query.nama }}
            </strong>
          </div>

          <div class="bp3mi-result-item">
            <span>Tanggal</span>
            <strong>
              {{ route.query.tgl }}
            </strong>
          </div>

          <div class="bp3mi-subtitle" style="text-align: center; font-weight: bold;">
            <span>Mohon tunggu nomor dipanggil</span>
          </div>

        </div>

      </article>

      <footer>
        <div class="grid gap-3 md:grid-cols-1">

          <button class="bp3mi-button" @click="$router.push('/')">
            Kembali
          </button>

        </div>
      </footer>

    </section>

  </main>

</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>