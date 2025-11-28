export interface ChatMessage {
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

export class ChatManager {
  private chatHistory: HTMLElement;
  private userInput: HTMLInputElement;
  private messages: ChatMessage[] = [];
  private commandHistory: string[] = [];
  private historyIndex: number = -1;
  private isProcessing: boolean = false;

  constructor(chatHistoryElement: HTMLElement, userInputElement: HTMLInputElement) {
    this.chatHistory = chatHistoryElement;
    this.userInput = userInputElement;
  }

  public addMessage(text: string, sender: 'user' | 'agent'): void {
    const message: ChatMessage = {
      text,
      sender,
      timestamp: new Date(),
    };

    this.messages.push(message);

    const div = document.createElement('div');
    div.className = `msg ${sender}`;
    div.innerHTML = text;

    this.chatHistory.appendChild(div);
    this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
  }

  public addLoadingMessage(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'msg g loading';
    div.textContent = 'Thinking...';

    this.chatHistory.appendChild(div);
    this.chatHistory.scrollTop = this.chatHistory.scrollHeight;

    return div;
  }

  public removeLoadingMessage(element: HTMLElement): void {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }

  public setProcessing(isProcessing: boolean): void {
    this.isProcessing = isProcessing;
    this.userInput.disabled = isProcessing;
  }

  public isProcessingCommand(): boolean {
    return this.isProcessing;
  }

  public getInputValue(): string {
    return this.userInput.value.trim();
  }

  public clearInput(): void {
    this.userInput.value = '';
  }

  public addToCommandHistory(command: string): void {
    this.commandHistory.push(command);
    this.historyIndex = this.commandHistory.length;
  }

  public getPreviousCommand(): string {
    if (this.commandHistory.length === 0) return '';

    if (this.historyIndex > 0) {
      this.historyIndex--;
      return this.commandHistory[this.historyIndex];
    }

    return '';
  }

  public getNextCommand(): string {
    if (this.commandHistory.length === 0) return '';

    if (this.historyIndex < this.commandHistory.length - 1) {
      this.historyIndex++;
      return this.commandHistory[this.historyIndex];
    } else if (this.historyIndex === this.commandHistory.length - 1) {
      this.historyIndex++;
      return '';
    }

    return '';
  }

  public getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  public clearMessages(): void {
    this.messages = [];
    this.chatHistory.innerHTML = '';
  }
}
