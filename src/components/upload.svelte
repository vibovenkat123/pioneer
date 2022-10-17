<script lang="ts">
  import {
    addDoc,
    collection,
    getDocs,
    query,
    where,
  } from "firebase/firestore";
  import {
    ref,
    listAll,
    type StorageReference,
    uploadBytesResumable,
    getDownloadURL,
  } from "firebase/storage";
  import { authState } from "rxfire/auth";
  import { storage, db, auth } from "../firebase";
  export let upload = true;
  // add prop user
  const user: { subscribe(): void } = authState(auth);
  // add variable for the file upload input
  let fileUploadInput: HTMLInputElement;
  // create variable for the name input's value
  let value = "";
  // add variable for files array
  let files: { name: string; path: string }[] = [];
  // add variable which holds all the files data
  let filesElements: {
    path: string;
    ref: StorageReference;
    name: string;
    progress?: number;
    display: string;
  }[] = [];
  // set the file array to all of the files
  // submit function
  async function submit() {
    // get all files from the input
    const files = fileUploadInput.files;
    // loop through files
    if (files !== null && fileUploadInput.files !== null) {
      for (let i = 0; i < files.length; i++) {
        // get file variable
        const file = fileUploadInput.files[i];
        // get reference to file in firebase storage
        const path = `files/${Date.now() * Math.random()}${$user.uid.substring(
          0,
          15
        )}${file.name}`;
        const refFile = ref(storage, path);
        // add files data to firestore
        // start the upload task
        const uploadTask = uploadBytesResumable(refFile, file);

        if (value === "") {
          value = file.name;
        }
        // push the elements to the files array
        filesElements.push({
          path,
          ref: refFile,
          name: value,
          display: $user.displayName,
        });
        // get upload speed and percent done
        uploadTask.on("state_changed", (snapshot) => {
          // get the percent done
          const progress: number =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progress === 100) {
            console.log(value);
            addDoc(collection(db, "files"), {
              uid: $user.uid,
              path,
              name: value,
              display: $user.displayName,
            });
            value = "";
          }
          // add the progress to the files array
          filesElements[i].progress = progress;
        });
      }
    }
  }
</script>

<main>
  <div class="flex h-full w-full justify-center items-center flex-col fixed">
    <!-- button to go back to homepage -->
    <button
      on:click={() => {
        upload = false;
      }}
      class="btn btn-outline btn-primary mb-5">Back</button
    >
    <h1 class="text-3xl mb-5">Your Files:</h1>
    <label
      for="custom"
      class="btn btn-outline btn-secondary hover:cursor-pointer mb-5"
    >
      <input
        type="file"
        id="input"
        multiple
        class="hover:cursor-pointer rounded-md"
        accept="image/*"
        bind:this={fileUploadInput}
      />
    </label>
    <label for="name">
      <input
        type="text"
        name=""
        id="name"
        bind:value
        placeholder="name"
        class="input input-bordered w-full max-w-xs mb-5 input-accent"
      />
    </label>
    <button on:click={submit} class="btn btn-success btn-outline">Submit</button
    >
    <!-- Loop through the files and set the name, link, and progress if available-->
    <ol class="menu bg-base-200 p-4 rounded-md mt-5 mb-5 list-decimal">
      <li class="menu-title"><span>Images</span></li>
      {#each filesElements as uploadFile}
        <li>
          <div>
            <p>{uploadFile.name}</p>
            {#if uploadFile.progress}
              <p>{uploadFile.progress}%</p>
            {/if}
          </div>
        </li>
      {/each}
    </ol>
  </div>
</main>
