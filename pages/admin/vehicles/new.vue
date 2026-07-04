<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Vehicul nou' })
</script>

<template>
  <AdminVehicleForm />
</template>
