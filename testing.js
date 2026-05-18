const fetchUrl = require('node-fetch');

async function test() {
  try {
    const searchRes = await fetchUrl("https://fypshort.my.id/api/provider/freereels?action=search&query=love");
    const searchJson = await searchRes.json();
    console.log("Search Result 0: ", searchJson.data[0]);
    if (searchJson.data && searchJson.data.length > 0) {
      const detailRes = await fetchUrl(`https://fypshort.my.id/api/provider/freereels?action=episodes&id=${searchJson.data[0].id}`);
      const detailJson = await detailRes.json();
      console.log("Episodes amount:", detailJson.data.length);
      
      const streamRes = await fetchUrl(`https://fypshort.my.id/api/provider/freereels?action=stream&id=${encodeURIComponent(detailJson.data[0].id)}`);
      const streamJson = await streamRes.json();
      console.log("Stream:", streamJson);
    }
  } catch(e) {
    console.error(e);
  }
}
test();
