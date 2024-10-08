function generateHashKey(stringInput) {
    const stringData = stringInput.replace(/\s/g, "");
    let hash = 0, i, chr;
    if (stringData.length === 0) return hash;
    for (i = 0; i < stringData.length; i++) {
      chr = stringData.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash;
  }
  
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  const getAll = async (server, { hdbCore, logger }) => {
      server.get("/stream", async (request, reply) => {
          try {
              const question = request.query.question;
  
              const hashKey = generateHashKey(JSON.stringify(question));
              const selectQuery = {
                  body: {
                      operation: 'search_by_id',
                      database: 'apicache',
                      table: 'cache',
                      ids: [hashKey],
                      get_attributes: ['content']
                  }
              };
  
              reply.raw.writeHead(200, { 'Content-Type': 'application/stream+json' });
  
              const cachedPayload = await hdbCore.requestWithoutAuthentication(selectQuery);
              if (cachedPayload.length === 1) {
                  delete cachedPayload[0]['id'];
                  delete cachedPayload[0]['__createdtime__'];
                  delete cachedPayload[0]['__updatedtime__'];
  
                  const textArray = cachedPayload[0]['content'].split(' ');
                  for (let i = 0; i < textArray.length; i++) {
                      reply.raw.write(`${textArray[i]} `);
                      await sleep(100); // Simulates a delay
                  }
                  return reply.raw.end();
  
              } else {
                  const response = await fetch("https://origin-stream.edgecloud9.com/stream");
                  let textResult = '';
  
                  for await (const part of response.body.values()) {
                      reply.raw.write(part);
                      textResult += new TextDecoder().decode(part);
                  }
  
                  const dbRecord = { 
                    id: hashKey,
                    content: textResult.trim()
                  }
                  const insertQuery = { 
                    body: {
                      operation: "upsert",
                      schema: "apicache",
                      table: "cache",
                      records: [dbRecord]
                    }
                  };
                  hdbCore.requestWithoutAuthentication(insertQuery);
  
                  return reply.raw.end();
              }
          } catch (exception) {
              reply.send({ msg: `miami error occured: ${exception}`, detail: exception.message });
          }
      });
  }
  export default getAll;
  
  
  