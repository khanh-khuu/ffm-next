// Cloudflare API
//   addEventListener("fetch", event => {
//     event.respondWith(handleRequest(event.request))
//   })
  
  
//   const endpoint = 'https://www.clipto.com/api/youtube';
  
//   async function handleRequest(request) {
//     const url = new URL(request.url);
//     const ytUrl = url.searchParams.get('url');
  
//     if (!ytUrl) return Response.json({
//       error: 'Url does not exist.'
//     });
  
//     const res = await fetch(endpoint, {
//       method: 'POST',
//       headers: {
//         'content-type': 'application/json',
//       },
//       body: JSON.stringify({
//         url: ytUrl
//       }),
//     });
  
//     const json = await res.json();
  
//     const downloadUrl = json.medias.find(x => x.extension === 'mp4' && x.is_audio)?.url;
  
//     if (!downloadUrl) return new Response("vid not found", { status: 500 })
  
//     try {
//       // Fetch the file from the specified URL
//       const response = await fetch(downloadUrl);
  
//       // Check if the response is ok (status code 200)
//       if (!response.ok) {
//         throw new Error(`Failed to fetch file: \${response.status}`);
//       }
  
//       const newHeaders = new Headers(response.headers);
//       newHeaders.append('X-Description', json.title);
  
//       // Return the response directly to the client
//       return new Response(response.body, {
//         status: response.status,
//         statusText: response.statusText,
//         headers: newHeaders
//       });
//     } catch (error) {
//       return new Response(error.toString(), { status: 500 });
//     }
//   }