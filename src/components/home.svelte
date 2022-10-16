<script lang="ts">
  import { collection, getDocs, query, where } from "firebase/firestore";
  import {
    getDownloadURL,
    listAll,
    ref,
    type StorageReference,
  } from "firebase/storage";
  import { authState } from "rxfire/auth";
  import { auth, db, storage } from "../firebase";
  import Upload from "./upload.svelte";
  // add variable to check what screen the user wants to be on
  let upload = false;
  let user = authState(auth);
  type data = {
    ref: StorageReference;
    name: string;
    display: string;
  }[];
  // create array which will hold the data
  let data: data = [];
  async function getFiles() {
    // assign all the files to data array
    data = await getAll();
  }
  async function getAll() {
    let files: { name: string; display: string }[] = [];
    // get reference to files
    const dir = ref(storage, "files");
    // get all files
    const allFiles = await listAll(dir);
    let index = 0;
    allFiles.items.forEach(async (i) => {
      if ($user) {
        // query the files
        const queryFiles = query(
          collection(db, "files"),
          where("path", "==", i.fullPath)
        );
        const snapshot = await getDocs(queryFiles);
        // push data to files from firestore array
        snapshot.forEach((n) => {
          files.push({ name: n.data().name, display: n.data().display });
        });
      }
      // get path
      const path = i.fullPath;
      // get reference
      const refFile = ref(storage, path);
      // push to the data array
      data = [
        ...data,
        {
          ref: refFile,
          name: files[index].name,
          display: files[index].display,
        },
      ];
      index++;
    });
    // return the data
    return data;
  }
  function copy(text: string) {
    // set text context and copy link
    const tooltip = document.getElementById("tooltip");
    tooltip!.innerHTML = "Copied!";
    navigator.clipboard.writeText(text);
  }
  function resetCopy() {
    // reset text context
    const tooltip = document.getElementById("tooltip");
    tooltip!.innerHTML = "Copy To Clipboard";
  }
  getFiles();
</script>

<main>
  {#if upload}
    <!-- if the user wants to upload -->
    <Upload bind:upload />
  {:else}
    <!-- If the user wants to browse images -->
    <button
      on:click={() => {
        upload = true;
      }}>Upload</button
    >
    <p>Refresh to see changes</p>
    {#each data as d}
      <p>{d.name} by {d.display}</p>
      {#await getDownloadURL(d.ref)}
        <p>loading...</p>
      {:then url}
        <img src={url} alt="" width="200" />
      {/await}
      {#await getDownloadURL(d.ref) then url}
        <div class="tooltip">
          <!-- svelte-ignore a11y-mouse-events-have-key-events -->
          <button
            on:click={() => {
              copy(url);
            }}
            on:mouseout={resetCopy}
          >
            <span class="tooltiptext" id="tooltip">Copy To Clipboard</span>
            Copy
          </button>
        </div>
        <a href={url} target="_blank" rel="noreferrer">Download</a>
      {/await}
    {/each}
  {/if}
</main>

<style>
  .tooltip {
    position: relative;
    display: inline-block;
  }

  .tooltip .tooltiptext {
    visibility: hidden;
    width: 140px;
    background-color: #555;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    bottom: 150%;
    left: 50%;
    margin-left: -75px;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .tooltip .tooltiptext::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #555 transparent transparent transparent;
  }

  .tooltip:hover .tooltiptext {
    visibility: visible;
    opacity: 1;
  }
</style>
