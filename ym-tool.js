const rootEl = document.querySelector('#ym-tool-id');
const inputMarkup = `
  <textarea id="ym-tool-text-input-id" class="ym-tool__text-input" placeholder="Text"></textarea>
  <textarea id="ym-tool-request-input-id" class="ym-tool__request-input" placeholder="Prefix">Please, find lexi C1 level and above phrasal verbs in the text: 
  </textarea>
  Part size: <input id="ym-tool-size-input-id" class="ym-tool__size-input" value="2500" />
  <br />
  API key: <input id="ym-tool-key-input" class="ym-tool__key-input" value="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" />
  <button id="ym-tool-action" class="ym-tool__button">Divide</button>
`;

const genOutputEl = (partNum, text) => {
  return `
    <div class="ym-tool__output-wrap">
      <label>${partNum}</label>
      <textarea class="ym-tool__output_textarea" data-openai-given-id=${partNum}>${text}</textarea>
      <br />
      <button class="ym-tool__ask-button" data-openai-action-id=${partNum}>Ask the ChatGPT</button>
      <br />
      <div class="ym-tool__loader" data-openai-loader-id=${partNum}></div>
      <div class="ym-tool__output_response_textarea" data-openai-output-id=${partNum}></div>
    </div>
  `;
}

const title = `<h2>Divide text by symbols count</h2>`; 

const outputRootEl = `
  <h3>Result:</h3>
  <div id="ym-tool-output" class="ym-tool__output"></div>
`;

function generateOutputView() {
  const requestText = document.querySelector('#ym-tool-request-input-id').value;
  const allText = document.querySelector('#ym-tool-text-input-id').value;
  const size = document.querySelector('#ym-tool-size-input-id').value;
  const re = new RegExp(`.{1,${size}}`, 'g');
  const textsArr = allText.replace(/\s+/g, ' ').match(re);
  document.querySelector('#ym-tool-output').innerHTML =
   (textsArr || [allText]).reduce((acc, text, index) => (acc + genOutputEl(index + 1, requestText + ' ' + text)), '');
  
  initEventsOnGeneratedElements();
}

function initEvents() {
  document.querySelector('#ym-tool-action').addEventListener('click', generateOutputView);
}

function initEventsOnGeneratedElements() {
  document.querySelectorAll('.ym-tool__ask-button').forEach((el) => {
    const id = el.dataset.openaiActionId;
    el.addEventListener('click', () => askForChatGPT(id));
  });
  
}

function askForChatGPT(id) {
  const contextString = document.querySelector(`.ym-tool__output_textarea[data-openai-given-id="${id}"]`)
    .value;
  const key = document.querySelector('#ym-tool-key-input')
    .value;

  showLoader(id);

  fetch("https://api.openai.com/v1/engines/text-davinci-003/generate", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + key,
    },
    body: JSON.stringify({
        best_of: 1,
        context: contextString,
        temperature: 1,
        completions: 1,
        top_p: 0.5,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        logprobs: 0,
        stream: false,
        length: 500 + contextString.length,
    })
  })
  .then(response => response.json())
  .then((data) => {
    const responseText = data.data[0].text.join("")
      .replace(contextString, "").trim();
    console.log(' > ', responseText);
    showChatGPTResponse(id, responseText);
  })
  .catch(error => {
    console.error(error);
    alert('Error, sorry');
  })
  .finally(() => hideLoader(id));

}

function showChatGPTResponse(id, responseText) {
  const textareaEl = document.querySelector(`.ym-tool__output_response_textarea[data-openai-output-id="${id}"]`);
  textareaEl.innerHTML = responseText;
}

function showLoader(id) {
  const loadder = document.querySelector(`.ym-tool__loader[data-openai-loader-id="${id}"]`);
  loadder.innerHTML = ' ... loading ...';
}

function hideLoader(id) {
  const loadder = document.querySelector(`.ym-tool__loader[data-openai-loader-id="${id}"]`);
  loadder.innerHTML = '';
}

function renderInitView() {
  rootEl.innerHTML = title + inputMarkup + outputRootEl;
  initEvents();
}

renderInitView();