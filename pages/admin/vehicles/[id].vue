<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Editează vehicul' })

const route = useRoute()
</script>

<template>
  <AdminVehicleForm :vehicle-id="route.params.id as string" />
</template>
