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
  // add variable to show images
  let preview = false;
  // add variable for the file upload input
  let fileUploadInput: HTMLInputElement;
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
  async function getFiles() {
    filesElements = await allFiles();
  }
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
        // push the elements to the files array
        filesElements.push({
          path,
          ref: refFile,
          name: file.name,
          display: $user.displayName,
        });
        // get upload speed and percent done
        uploadTask.on("state_changed", (snapshot) => {
          // get the percent done
          const progress: number =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progress === 100) {
            addDoc(collection(db, "files"), {
              uid: $user.uid,
              path,
              name: file.name,
              display: $user.displayName,
            });
          }
          // add the progress to the files array
          filesElements[i].progress = progress;
        });
      }
    }
  }
  // function to get all files
  async function allFiles() {
    // get reference to files directory
    const dir = ref(storage, "files");
    // get all files
    const allFiles = await listAll(dir);
    // get the files with the same user id
    if ($user) {
      // query the files
      const queryFiles = query(
        collection(db, "files"),
        where("uid", "==", $user.uid)
      );
      const snapshot = await getDocs(queryFiles);
      // push data to a files from firestore array
      snapshot.forEach((n) => {
        files.push({ name: n.data().name, path: n.data().path });
      });
    }
    // loop through files
    let index = 0;
    allFiles.items.forEach(async () => {
      // get path
      const path = files[index].path;
      // get reference
      const refFile = ref(storage, path);
      // push to the files array
      filesElements.push({
        path,
        ref: refFile,
        name: files[index].name,
        display: $user.displayName,
      });
      index++;
    });
    // return the array
    return filesElements;
  }
  // call getFiles to get the files
  getFiles();
  console.log(filesElements.length);
</script>

<main>
  <!-- button to go back to homepage -->
  <button
    on:click={() => {
      upload = false;
    }}>Back</button
  >
  <h1>Your Files:</h1>
  <input
    type="file"
    id="input"
    multiple
    accept="image/*"
    bind:this={fileUploadInput}
  />
  <button on:click={submit}>Submit</button>
  <!-- Loop through the files and set the name, link, and progress if available-->
  {#each filesElements as uploadFile}
    <div>
      <p>{uploadFile.name}</p>
      {#if uploadFile.progress}
        <p>{uploadFile.progress}%</p>
      {/if}
    </div>
  {/each}
  <!-- have a button that previews the images -->
  <button
    on:click={() => {
      preview = !preview;
    }}>Preview</button
  >
  {#if preview}
    {#each filesElements as uploadFile}
      <div>
        <p>{uploadFile.name}</p>
        {#await getDownloadURL(uploadFile.ref)}
          <p>loading...</p>
        {:then url}
          <img src={url} alt="" width="200" />
        {/await}
      </div>
    {/each}
  {/if}
</main>
