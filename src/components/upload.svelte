<script lang="ts">
  import {
    ref,
    listAll,
    type StorageReference,
    uploadBytesResumable,
    getDownloadURL,
  } from "firebase/storage";
  import { storage } from "../firebase";
  // add variable for the file upload input
  let fileUploadInput: HTMLInputElement;
  // add variable which holds all the files data
  let filesElements: {
    path: string;
    ref: StorageReference;
    name: string;
    progress?: number;
  }[] = [];
  // set the file array to all of the files
  async function getFiles() {
    filesElements = await allFiles();
    console.log(filesElements);
  }
  // submit function
  async function submit() {
    // get all files from the input
    const files = fileUploadInput.files;
    // loop through files
    for (let i = 0; i < files!.length; i++) {
      // get file variable
      const file = fileUploadInput.files![i];
      // get reference to file in firebase storage
      const refFile = ref(storage, `files/${file.name}`);
      // start the uplaod task
      const uploadTask = uploadBytesResumable(refFile, file);
      // push the elements to the files array
      filesElements.push({
        path: `files/${file.name}`,
        ref: refFile,
        name: file.name,
      });
      // get upload speed and percent done
      uploadTask.on("state_changed", (snapshot) => {
        // get the percent done
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // add the progress to the files array
        filesElements[i].progress = progress;
      });
    }
  }
  // function to get all files
  async function allFiles() {
    // get reference to files directory
    const dir = ref(storage, "files");
    // get all files
    const allFiles = await listAll(dir);
    // loop through files
    allFiles.items.forEach(async (i) => {
      // get path
      const path = i.fullPath;
      // get reference
      const refFile = ref(storage, path);
      // push to the files array
      filesElements.push({
        path,
        ref: refFile,
        name: i.name,
      });
    });
    // return the array
    return filesElements;
  }
  // call getFiles to get the files
  getFiles();
</script>

<main>
  <h1>Your Files:</h1>
  <input type="file" id="input" multiple bind:this={fileUploadInput} />
  <button on:click={submit}>Submit</button>
  <!-- Loop through the files and set the name, link, and progress if available-->
  {#each filesElements as uploadFile}
    <div>
      <p>{uploadFile.name}</p>
      {#await getDownloadURL(uploadFile.ref)}
        <p>Loading...</p>
      {:then url}
        <img src={url} alt="" width="300" />
      {/await}
      {#if uploadFile.progress}
        <p>{uploadFile.progress}%</p>
      {/if}
    </div>
  {/each}
</main>
