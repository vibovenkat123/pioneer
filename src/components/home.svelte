<script lang="ts">
  import { reload } from "firebase/auth";
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
    // copy link
    navigator.clipboard.writeText(text);
  }
  getFiles();
</script>

<main>
  {#if upload}
    <!-- if the user wants to upload -->
    <Upload bind:upload />
  {:else}
    <!-- If the user wants to browse images -->
    <div class="flex items-center flex-col">
      <div class="flex items-center flex-col mb-3">
        <button
          on:click={() => {
            upload = true;
          }}
          class="btn btn-outline mb-3 mt-3">Upload</button
        >
        <button
          class="btn btn-outline btn-info"
          on:click={() => {
            location.reload();
          }}>Refresh to see changes</button
        >
      </div>
      <div class="flex justify-center w-3/4">
        <div class="grid-container">
          {#each data as d}
            <div
              class="card-compact card bg-black text-white p-3 mr-5 border-2 border-gray-800"
            >
              {#await getDownloadURL(d.ref)}
                <p>loading...</p>
              {:then url}
                <figure>
                  <img src={url} alt="" class="image-full rounded-md" />
                </figure>
              {/await}
              <div class="card-body">
                <p class="card-title">{d.name}</p>
                <p class="text-lg">by {d.display}</p>
                {#await getDownloadURL(d.ref) then url}
                  <div class="flex w-full justify-between">
                    <div class="tooltip" data-tip="Copy To Clipboard">
                      <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                      <button
                        on:click={() => {
                          copy(url);
                        }}
                        class=" btn btn-outline btn-primary text-center"
                      >
                        Copy
                      </button>
                    </div>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      class="btn tooltip btn-outline flex items-center"
                      data-tip="Download">Download</a
                    >
                  </div>
                {/await}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
</style>
