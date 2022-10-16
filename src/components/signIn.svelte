<script lang="ts">
  import { signInWithPopup } from "firebase/auth";
  import { auth, provider } from "../firebase";
  // add function to sign in
  async function signIn() {
    signInWithPopup(auth, provider);
  }
</script>

<main>
  <button on:click={signIn}>Sign In</button>
</main>
