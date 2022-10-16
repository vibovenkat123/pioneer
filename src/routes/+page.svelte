<script lang="ts">
  import SignIn from "../components/signIn.svelte";
  import { authState } from "rxfire/auth";
  import { auth } from "../firebase";
  import Upload from "../components/upload.svelte";
  // get user state
  let user: { subscribe(): void } = authState(auth);
</script>

<main>
  <!-- if the user is signed in, go to upload page, else go to sign in page -->
  {#if $user}
    <Upload bind:user />
  {:else}
    <SignIn />
  {/if}
</main>
