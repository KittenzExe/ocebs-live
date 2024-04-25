<script lang="ts">
    import { onMount, onDestroy } from 'svelte';

    let users: any[] = [];
    let ws: WebSocket;

    onMount(() => {
        ws = new WebSocket('wss://oce-api.kittenzexe.com/v1/0');

        ws.onmessage = (event) => {
            //console.log('Raw data:', event.data);
            if (event.data && (event.data.startsWith('{') || event.data.startsWith('['))) {
                const responseData = JSON.parse(event.data);
                console.log('Parsed data:', responseData);
                users = responseData.filter((user: any) => user['beat-saber_status'] && user['beat-saber_status'] !== 'Not playing Beat Saber');
                users = users.filter(user => user['beat-saber_status']);
            } else {
                console.error('Received non-JSON data:', event.data);
            }

            users.forEach(user => {
                if (user['beat-saber_status'] && user['beat-saber_status'].large_image && user['beat-saber_status'].large_image.includes('cdn.beatsaver.com')) {
                    const parts = user['beat-saber_status'].large_image.split('cdn.beatsaver.com');
                    user['beat-saber_status'].large_image = parts[parts.length - 1].replace('.png', '');
                }

                // Convert role_color from hexadecimal number to CSS hex color code
                let hexColor = user.role_color.toString(16);
                while (hexColor.length < 6) {
                    hexColor = '0' + hexColor;
                }
                user.role_color = '#' + hexColor;

                console.log('Updated user:', user);
            });
        };

        onDestroy(() => {
            if (ws) {
                ws.close();
            }
        });
    });
</script>

<head>
    <title>ocebs live</title>
    <meta name="description" content="Website for getting the current oce beat saber live sessions">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://ocebs.kittenzexe.com/">
    <meta property="og:title" content="ocebs live">
    <meta property="og:description" content="Website for getting the current oce beat saber live sessions">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://ocebs.kittenzexe.com/">
    <meta property="twitter:title" content="ocebs live">
    <meta property="twitter:description" content="Website for getting the current oce beat saber live sessions">

    <meta name="theme-color" content="#7d77d7">
</head>

<div class="w-screen min-h-screen p-5 bg-zinc-950 flex flex-col justify-start items-center">
    <div class="w-full lg:w-2/3 flex justify-between text-zinc-50 text-2xl lg:text-3xl mb-5">
        <div>
            <h1>ocebs live</h1>
        </div>
        <div class="flex gap-x-3">
            <a href="https://github.com/KittenzExe/ocebs-live?tab=readme-ov-file#setup" target="_blank">Setup</a>
            <p class="md:block hidden">-</p>
            <a href="https://github.com/KittenzExe/ocebs-live" target="_blank">GitHub</a>
        </div>
    </div>
    <div class="w-full xl:w-5/6 flex flex-col gap-3">
        {#if users.length === 0}
            <div class="w-full min-h-28 p-2 flex justify-center items-center rounded-2xl overflow-hidden relative">
                <div class="absolute inset-0" style="background: url('https://cdn.discordapp.com/app-assets/1028340906740420711/1056826167933546576.png') no-repeat center/cover; filter: blur(10px)"></div>
                <div class="w-4/5 h-20 bg-zinc-900 rounded-xl flex overflow-hidden gap-x-3 relative">
                    <div class="h-full w-full pt-2 pb-2 text-zinc-50 flex justify-center items-center">
                        <p>No-one is playing right now</p>
                    </div>
                </div>
            </div>
        {:else}
            {#each users as user (user.id)}
                {#if user['beat-saber_status'].state === 'Main Menu'}
                <div class="w-full min-h-28 p-2 flex justify-center items-center rounded-2xl overflow-hidden relative">
                    <div class="absolute inset-0" style="background: url('{user['beat-saber_status'].large_image}') no-repeat center/cover; filter: blur(10px)"></div>
                    <div class="w-4/5 h-20 bg-zinc-900 rounded-xl flex overflow-hidden gap-x-3 relative pl-2 xl:pl-0">
                        <img src="{user.avatar_url}" alt="" class="h-full rounded-xl md:block hidden">
                        <img src="https://cdn.beatsaver.com{user['beat-saber_status'].large_image}" alt="" class="h-full rounded-xl lg:block hidden">
                            <div class="flex justify-between w-full">
                                <div class="pt-2 pb-2 text-zinc-50">
                                    <p><span style="color: {user.role_color};">{user.username}</span> is in the Main Menu</p>
                                    <p>Time Elapsed: {Math.floor(user['beat-saber_status'].time_elapsed / 60)}:{user['beat-saber_status'].time_elapsed % 60 < 10 ? '0' : ''}{user['beat-saber_status'].time_elapsed % 60}</p>
                                </div>
                                <div class="flex flex-col gap-x-2 m-2 justify-end">
                                    <a href="{user.url}" target="_blank" class="h-full w-16 bg-zinc-800 rounded-t-md flex justify-center items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chart-bar" width="30" height="30" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M3 12m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                            <path d="M9 8m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                            <path d="M15 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                            <path d="M4 20l14 0" />
                                        </svg>
                                    </a>
                                    <a href="https://oce-api.kittenzexe.com/v1/{user.uid}" target="_blank" class="h-full w-16 bg-zinc-800 rounded-b-md flex justify-center items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-api" width="30" height="30" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
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
                    <div class="w-full min-h-28 p-2 flex justify-center items-center rounded-2xl overflow-hidden relative">
                        <div class="absolute inset-0" style="background: url('https://cdn.beatsaver.com{user['beat-saber_status'].large_image}') no-repeat center/cover; filter: blur(10px)"></div>
                        <div class="w-4/5 h-auto flex bg-zinc-900 rounded-xl overflow-hidden gap-x-3 relative pl-2 xl:pl-0">
                            <div class="flex gap-x-3 max-h-28 max-w-28 lg:max-w-60">
                                <img src="{user.avatar_url}" alt="" class="h-full rounded-xl md:block hidden">
                                <img src="https://cdn.beatsaver.com{user['beat-saber_status'].large_image}" alt="" class="h-full rounded-xl lg:block hidden">
                            </div>
                            <div class="flex justify-between w-full">
                                <div class="pt-2 pb-2 text-zinc-50">
                                    <p><span style="color: {user.role_color};">{user.username}</span> is playing: {user['beat-saber_status'].details}</p>
                                    <p >{user['beat-saber_status'].state}</p>
                                    <p>Time Left: {Math.floor(user['beat-saber_status'].time_left / 60)}:{user['beat-saber_status'].time_left % 60 < 10 ? '0' : ''}{user['beat-saber_status'].time_left % 60}</p>
                                </div>
                                <div class="flex flex-col gap-x-2 m-2 justify-end">
                                    <a href="{user.url}" target="_blank" class="h-full w-16 bg-zinc-800 rounded-t-md flex justify-center items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chart-bar" width="30" height="30" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M3 12m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                            <path d="M9 8m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                            <path d="M15 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                            <path d="M4 20l14 0" />
                                        </svg>
                                    </a>
                                    <a href="https://beatsaver.com/maps/{user['beat-saber_status'].small_image_text.split('!bsr ')[1]}" target="_blank" class="h-full w-16 bg-zinc-800 rounded-none flex justify-center items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-external-link" width="30" height="30" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" />
                                            <path d="M11 13l9 -9" />
                                            <path d="M15 4h5v5" />
                                        </svg>
                                    </a>
                                    <a href="https://oce-api.kittenzexe.com/v1/{user.uid}" target="_blank" class="h-full w-16 bg-zinc-800 rounded-b-md flex justify-center items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-api" width="30" height="30" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
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
                {:else if user['beat-saber_status'].state === null}
                    <div class="w-full min-h-28 p-2 flex justify-center items-center rounded-2xl overflow-hidden relative">
                        <div class="absolute inset-0" style="background: url('{user.avatar_url}') no-repeat center/cover; filter: blur(10px)"></div>
                        <div class="w-4/5 h-28 bg-zinc-900 rounded-xl flex overflow-hidden gap-x-3 relative pl-2 xl:pl-0">
                            <img src="{user.avatar_url}" alt="" class="h-full rounded-xl md:block hidden">
                            <div class="flex justify-between w-full">
                                <div class="pt-2 pb-2 text-zinc-50">
                                    <p><span style="color: {user.role_color};">{user.username}</span> is playing but no data can be found.</p>
                                    <p>Time Elapsed: {Math.floor(user['beat-saber_status'].time_elapsed / 60)}:{user['beat-saber_status'].time_elapsed % 60 < 10 ? '0' : ''}{user['beat-saber_status'].time_elapsed % 60}</p>
                                </div>
                                <div class="flex flex-col gap-x-2 m-2 justify-end">
                                    <a href="{user.url}" target="_blank" class="h-full w-16 bg-zinc-800 rounded-t-md flex justify-center items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chart-bar" width="30" height="30" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M3 12m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                            <path d="M9 8m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                            <path d="M15 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                            <path d="M4 20l14 0" />
                                        </svg>
                                    </a>
                                    <a href="https://oce-api.kittenzexe.com/v1/{user.uid}" target="_blank" class="h-full w-16 bg-zinc-800 rounded-b-md flex justify-center items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-api" width="30" height="30" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
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
    <div class="flex justify-center w-full lg:w-1/3 h-flex mt-3 p-2 bg-zinc-900 text-zinc-50 text-sm items-center rounded-full">
        <p class="text-center">Created by <a href="https://kittenzexe.com" target="_blank" class="text-[#7d77d7]">KittenzExe</a> for the oce beat saber discord server. Powered by <a href="https://kiku.kittenzexe.com" target="_blank" class="text-[#7d77d7]">Kiku</a></p>
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