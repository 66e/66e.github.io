// 在页面上生成一个id为"container"的div元素
const container = document.createElement('div');
container.id = 'container';
document.body.appendChild(container);

// 在"container"里面再生成含2个div
const div1 = document.createElement('div');
const div2 = document.createElement('div');
container.appendChild(div1);
container.appendChild(div2);

// 第一个div里面包含2个p元素
const p1 = document.createElement('p');
p1.textContent = "你好";
const p2 = document.createElement('p');
p2.textContent = "我好";
div1.appendChild(p1);
div1.appendChild(p2);

// 第二个div里面包含3个p元素
const p3 = document.createElement('p');
p3.textContent = "他好";
const p4 = document.createElement('p');
p4.textContent = "大家好";
const p5 = document.createElement('p');
p5.textContent = "才是真的好";
div2.appendChild(p3);
div2.appendChild(p4);
div2.appendChild(p5);

// 遍历"container"元素，生成一个播放序列
const elements = container.querySelectorAll('p');
const sequence = Array.from(elements).map(element => element.textContent);

// 朗读播放序列
let voices = []; // 初始化voices为空数组
let currentVoice = 0;

// voiceschanged事件监听器
window.speechSynthesis.onvoiceschanged = () => {
  voices = window.speechSynthesis.getVoices();
  //console.log(voices); // 打印语音列表，方便查找合适的语音索引
};

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  // 查找合适的语音索引，例如 voices[139] 和 voices[140]
  // 注意：语音索引可能因浏览器和操作系统而异
  const voice1 = voices.find(voice => voice.name === 'Microsoft Huihui Online (Natural) - zh-CN'); // 查找中文女声
  const voice2 = voices.find(voice => voice.name === 'Microsoft Yunxi Online (Natural) - zh-CN'); // 查找中文男声
  utterance.voice = currentVoice === 0 ? voice1 : voice2; // 使用找到的语音
  window.speechSynthesis.speak(utterance);
}

let i = 0;
function playSequence() {
    if (voices.length === 0) {
      setTimeout(playSequence, 100);
      return;
    }
    if (i < sequence.length) {
      const text = sequence[i];
      const utterance = new SpeechSynthesisUtterance(text);
      const voice1 = voices[139];
      const voice2 = voices[140];
      utterance.voice = currentVoice === 0 ? voice1 : voice2;
      currentVoice = 1 - currentVoice;
  
      // 获取当前 <p> 元素
      const target = document.querySelectorAll('#container > * > p')[i];
  
      // 添加 boundary 事件监听器
      utterance.addEventListener('boundary', ({ charIndex, charLength }) => {
        const fragment = document.createDocumentFragment();
      
        const beforeWord = document.createTextNode(text.slice(0, charIndex));
        const word = document.createElement('mark');
        word.textContent = text.slice(charIndex, charIndex + charLength);
        const afterWord = document.createTextNode(text.slice(charIndex + charLength, text.length));
      
        fragment.appendChild(beforeWord);
        fragment.appendChild(word);
        fragment.appendChild(afterWord);
      
        target.innerHTML = ''; // 清空 target 的内容
        target.appendChild(fragment);
      });
  
      utterance.onend = () => {
        // 恢复原始文本
        target.textContent = text;
        i++;
        playSequence();
      };
  
      window.speechSynthesis.speak(utterance);
    }
  }

// 创建按钮
const button = document.createElement('button');
button.textContent = '开始播放';
button.addEventListener('click', playSequence);
document.body.appendChild(button);