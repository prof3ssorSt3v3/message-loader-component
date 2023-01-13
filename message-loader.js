const template = document.createElement('template');
template.innerHTML = `
<style>

.loader{ 
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  justify-content: center;
  align-items: center;
  display: none;
}
.loader.active{
  display:flex;
}
.loader.standard-theme{
  background: linear-gradient(#663399, #9198e5);
  color: white;
}
.loader.gold-theme{
  background: linear-gradient(#f9c805, #c7c190);
  color: #222;
}
.loader.blue-theme{
  background: linear-gradient(#003399, #8daef1);
  color: white;
}
.messages{ 
  font-size: 4rem;
  color: white;
  font-weight: 100;
}
.hidden_data{
  display: none;
  font-size: 0.8rem; color: black;
}
</style>
<div class="loader ">
  <div class="messages"><span part="msg"></span></div>
  <div class="hidden_data"><slot name="messages"></slot></div>
</div>`;

export class MessageLoader extends HTMLElement {
  //a private array to hold the message list
  #messages = [];
  root;

  constructor() {
    super();
    //this.shadowRoot we can use throughout our component to access the template HTML
    this.root = this.attachShadow({ mode: 'closed' });
    // console.log(this.root);
    const clone = template.content.cloneNode(true);
    this.root.appendChild(clone);
    //get the messages and put them into this.#messages in connectedCallback
    //a page should only have one <message-loader>
    //if you need to access the <message-loader> on the containing page...
    this.messageLoaderElement = window.document.querySelector('message-loader');
  }

  static get observedAttributes() {
    //define attributes that will be observed from the <message-box> element
    return ['theme'];
  }

  get theme() {
    return this.getAttribute('theme');
  }
  set theme(value) {
    //RUNS SECOND
    this.setAttribute('theme', value);
  }

  connectedCallback() {
    //RUNS FIRST
    //start the timer to display a different random message every few seconds
    let messageSlot = this.root.querySelector('slot');
    let htmlMessages = messageSlot.assignedElements()[0];
    //htmlMessages.querySelectorAll('li').forEach or...
    for (let child of htmlMessages.children) {
      this.#messages.push(child.textContent);
    }
    let msg = this.#messages[Math.floor(Math.random() * this.#messages.length)];
    this.root.querySelector('.messages span').textContent = `${msg}...`;

    this.timmy = setInterval(this.swapMessage, 1234, this);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    //RUNS THIRD if there is NO theme attribute
    //RUNS FIRST if there is a theme attribute
    //changed a value of an attribute, or initial setting of value
    if (name === 'theme') {
      let theme = newVal.toLowerCase();
      if (theme === 'blue' || theme === 'gold' || theme === 'standard') {
        this.root.querySelector('div.loader').classList.add(`${theme}-theme`);
      } else {
        throw new Error(
          `${theme} is an invalid theme attribute value.\nStandard, blue, and gold are the only valid themes.`
        );
      }
    }
  }

  adoptedCallback() {
    //element was moved into a new DOM
    console.log('ADOPTEDCALLBACK');
  }

  disconnectedCallback() {
    //element removed from DOM
    console.log('DISCONNECTEDCALLBACK');
  }

  //Private INTERNAL method
  #swapMessage() {
    let index = Math.floor(Math.random() * this.#messages.length);
    let msg = this.#messages[index];
    this.root.querySelector('.messages span').textContent = `${msg}...`;
  }

  // METHODS TO BE CALLED EXTERNALLY

  addMessage(msg) {
    //add a message to the list
    this.#messages.push(msg);
  }

  hideLoader() {
    //method to be called from the HTML
    clearInterval(this.timmy);
    this.root.querySelector('div.loader').classList.remove('active');
  }

  showLoader() {
    clearInterval(this.timmy);
    this.root.querySelector('div.loader').classList.add('active');
    //we need to create a closure around this.swapMessage - bind
    //so that when it is called it remembers what `this` refers to
    this.timmy = setInterval(this.#swapMessage.bind(this), 1234);
  }
}

window.customElements.define('message-loader', MessageLoader);
/*
In the HTML we would have something like this:
<message-loader theme="standard">
  <ul slot="messages">
    <li>Adding the apples</li>
    <li>Eating the cheese</li>
    <li>Baking the crackers</li>
    <li>Counting the cucumbers</li>
    <li>Pinging the servers</li>
  </ul>
</message-loader>
*/
