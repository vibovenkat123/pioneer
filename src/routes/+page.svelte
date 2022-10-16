<script lang="ts">
  import SignIn from "../components/signIn.svelte";
  import { authState } from "rxfire/auth";
  import { auth } from "../firebase";
  import Home from "../components/home.svelte";
  // get user state
  let user: { subscribe(): void } = authState(auth);
</script>

<main>
  <!-- if the user is signed in, go to upload page, else go to sign in page -->
  {#if $user}
    <Home />
  {:else}
    <SignIn />
  {/if}
</main>
