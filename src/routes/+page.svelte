<script lang="ts">
    import { onMount, onDestroy } from 'svelte';

    let users: any[] = [];
    let ws: WebSocket;

    onMount(() => {
        ws = new WebSocket('wss://oce-api.kittenzexe.com/v1/0');

        ws.onmessage = (event) => {
            console.log('Raw data:', event.data);
            if (event.data && (event.data.startsWith('{') || event.data.startsWith('['))) {
                const responseData = JSON.parse(event.data);
                console.log('Parsed data:', responseData);
                users = responseData.filter((user: any) => user['beat-saber_status'] && user['beat-saber_status'] !== 'Not playing Beat Saber');
            } else {
                console.error('Received non-JSON data:', event.data);
            }

            users.forEach(user => {
                if (user['beat-saber_status'] && user['beat-saber_status'].large_image && user['beat-saber_status'].large_image.includes('cdn.beatsaver.com')) {
                    const parts = user['beat-saber_status'].large_image.split('cdn.beatsaver.com');
                    user['beat-saber_status'].large_image = parts[parts.length - 1].replace('.png', '');
                    console.log('Updated user:', user);
                }
            });
        };

        function copyToClipboard(text: string) {
            navigator.clipboard.writeText(text).then(function() {
                console.log('Copying to clipboard was successful!');
            }, function(err) {
                console.error('Could not copy text: ', err);
            });
        }

        onDestroy(() => {
            if (ws) {
                ws.close();
            }
        });
    });
</script>

<head>
    <title>ocebs live</title>
    <meta name="description" content="Website for getting the current oce beat sabers live sessions">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://ocebs.kittenzexe.com/">
    <meta property="og:title" content="ocebs live">
    <meta property="og:description" content="Website for getting the current oce beat sabers live sessions">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://ocebs.kittenzexe.com/">
    <meta property="twitter:title" content="ocebs live">
    <meta property="twitter:description" content="Website for getting the current oce beat sabers live sessions">

    <meta name="theme-color" content="#7d77d7">
</head>

<div class="w-screen min-h-screen p-5 bg-zinc-950 flex flex-col justify-start items-center">
    <div class="w-2/3 flex justify-between text-zinc-50 text-3xl mb-5">
        <div>
            <h1>ocebs live</h1>
        </div>
        <div>
            <a href="https://github.com/KittenzExe/ocebs-live?tab=readme-ov-file#setup" target="_blank">Setup</a>
            <a href="https://github.com/KittenzExe/ocebs-live" target="_blank">GitHub</a>
        </div>
    </div>
    <div class="w-5/6 flex flex-col gap-3">
        {#if users.length === 0}
            <div class="w-full h-20 flex justify-center items-center rounded-full overflow-hidden relative">
                <div class="absolute inset-0" style="background: url('https://cdn.discordapp.com/app-assets/1028340906740420711/1056826167933546576.png') no-repeat center/cover; filter: blur(10px)"></div>
                <div class="w-2/3 h-16 bg-zinc-900 rounded-xl flex overflow-hidden gap-x-3 relative">
                    <div class="h-full w-full pt-2 pb-2 text-zinc-50 flex justify-center items-center">
                        <p>No-one is playing right now</p>
                    </div>
                </div>
            </div>
        {:else}
            {#each users as user (user.id)}
                {#if user['beat-saber_status'].state === 'Main Menu'}
                    <div class="w-full h-20 flex justify-center items-center rounded-full overflow-hidden relative">
                        <div class="absolute inset-0" style="background: url('{user['beat-saber_status'].large_image}') no-repeat center/cover; filter: blur(10px)"></div>
                        <div class="w-2/3 h-16 bg-zinc-900 rounded-xl flex overflow-hidden gap-x-3 relative">
                            <img src="{user.avatar_url}" alt="" class="h-full rounded-xl">
                            <img src="{user['beat-saber_status'].large_image}" alt="" class="h-full rounded-xl">
                            <div class="h-full w-full pt-2 pb-2 text-zinc-50 flex justify-between">
                                <div class="w-3/5">
                                    <p>{user.username} is in the Main Menu</p>
                                    <p>Time Elapsed: {Math.floor(user['beat-saber_status'].time_elapsed / 60)}:{user['beat-saber_status'].time_elapsed % 60 < 10 ? '0' : ''}{user['beat-saber_status'].time_elapsed % 60}</p>
                                </div>
                                <div class="w-1/5 flex gap-x-2 mr-2 justify-end">
                                    <a href="https://oce-api.kittenzexe.com/v1/{user.uid}" target="_blank" class="h-full w-16 bg-zinc-800 rounded-md flex justify-center items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-api" width="50" height="50" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 13h5" />
                                            <path d="M12 16v-8h3a2 2 0 0 1 2 2v1a2 2 0 0 1 -2 2h-3" />
                                            <path d="M20 8v8" />
                                            <path d="M9 16v-5.5a2.5 2.5 0 0 0 -5 0v5.5" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                {:else if user['beat-saber_status'].time_elapsed === null}
                    <div class="w-full h-32 flex justify-center items-center rounded-full overflow-hidden relative">
                        <div class="absolute inset-0" style="background: url('https://cdn.beatsaver.com{user['beat-saber_status'].large_image}') no-repeat center/cover; filter: blur(10px)"></div>
                        <div class="w-2/3 h-28 bg-zinc-900 rounded-xl flex overflow-hidden gap-x-3 relative">
                            <img src="{user.avatar_url}" alt="" class="h-full rounded-xl">
                            <img src="https://cdn.beatsaver.com{user['beat-saber_status'].large_image}" alt="" class="h-full rounded-xl">
                            <div class="h-full w-full pt-2 pb-2 text-zinc-50 flex justify-between">
                                <div class="w-4/5">
                                    <p>{user.username} is playing: {user['beat-saber_status'].details}</p>
                                    <p>{user['beat-saber_status'].state}</p>
                                    <p>Time Left: {Math.floor(user['beat-saber_status'].time_left / 60)}:{user['beat-saber_status'].time_left % 60 < 10 ? '0' : ''}{user['beat-saber_status'].time_left % 60}</p>
                                </div>
                                <div class="w-1/5 flex gap-x-2 mr-2 justify-end">
                                    <a href="https://beatsaver.com/maps/{user['beat-saber_status'].small_image_text.split('!bsr ')[1]}" target="_blank" class="h-full w-16 bg-zinc-800 rounded-md flex justify-center items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-external-link" width="50" height="50" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" />
                                            <path d="M11 13l9 -9" />
                                            <path d="M15 4h5v5" />
                                        </svg>
                                    </a>
                                    <a href="https://oce-api.kittenzexe.com/v1/{user.uid}" target="_blank" class="h-full w-16 bg-zinc-800 rounded-md flex justify-center items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-api" width="50" height="50" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M4 13h5" />
                                            <path d="M12 16v-8h3a2 2 0 0 1 2 2v1a2 2 0 0 1 -2 2h-3" />
                                            <path d="M20 8v8" />
                                            <path d="M9 16v-5.5a2.5 2.5 0 0 0 -5 0v5.5" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}
            {/each}
        {/if}
    </div>
    <div class="w-1/3 h-8 mt-3 bg-zinc-900 text-zinc-50 text-sm flex justify-center items-center rounded-full">
        <p>Created by <a href="https://kittenzexe.com" target="_blank" class="text-[#7d77d7]">KittenzExe</a> for the oce beat saber discord server. Powered by <a href="https://kiku.kittenzexe.com" target="_blank" class="text-[#7d77d7]">Kiku</a></p>
    </div>
</div>

<!-- DEBUG
<main>
    {#each users as user (user.id)}
        <p>UID: {user.uid}</p>
        <p>Username: {user.username}</p>
        <p>Avatar URL: {user.avatar_url}</p>
        {#if typeof user['beat-saber_status'] === 'object' && user['beat-saber_status'] !== null}
            <p>State: {user['beat-saber_status'].state}</p>
            <p>Details: {user['beat-saber_status'].details}</p>
            <p>Large Image: {user['beat-saber_status'].large_image}</p>
            <p>Small Image: {user['beat-saber_status'].small_image}</p>
            <p>Large Image Text: {user['beat-saber_status'].large_image_text}</p>
            <p>Small Image Text: {user['beat-saber_status'].small_image_text}</p>
            <p>Start Timestamp: {user['beat-saber_status'].start_timestamp}</p>
            <p>End Timestamp: {user['beat-saber_status'].end_timestamp}</p>
            <p>Time Elapsed: {user['beat-saber_status'].time_elapsed}</p>
            <p>Time Left: {user['beat-saber_status'].time_left}</p>
        {:else if typeof user['beat-saber_status'] === 'string'}
            <p>Beat Saber Status: {user['beat-saber_status']}</p>
        {/if}
    {/each}
</main>
-->

<style>
    @font-face {
        font-family: 'Comfortaa';
        src: url('/Comfortaa-VariableFont_wght.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
    }

    div {
        font-family: 'Comfortaa', sans-serif;
    }
</style>