<script lang="ts">
  import { signInWithPopup } from "firebase/auth";
  import { auth, provider } from "../firebase";
  // add function to sign in
  async function signIn() {
    await signInWithPopup(auth, provider);
  }
</script>

<main>
  <div class="grid place-items-center h-screen">
    <button on:click={signIn} class="btn btn-outline btn-primary"
      >Sign In</button
    >
  </div>
</main>
