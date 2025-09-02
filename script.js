/**
 * Enhanced Calculator Class with Glassmorphism UI
 * Handles all calculator operations and display management
 */
class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
        this.maxDigits = 12; // Prevent overflow
    }

    // ===== CORE OPERATIONS =====
    clear() {
        this.currentOperand = '';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetDisplay = false;
    }

    delete() {
        if (this.shouldResetDisplay) {
            this.clear();
            return;
        }
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }

    appendNumber(number) {
        // Reset display after calculation
        if (this.shouldResetDisplay) {
            this.currentOperand = '';
            this.shouldResetDisplay = false;
        }
        
        // Prevent multiple decimal points
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        // Limit number length to prevent overflow
        if (this.currentOperand.length >= this.maxDigits) return;
        
        this.currentOperand = this.currentOperand.toString() + number.toString();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '' && this.previousOperand === '') return;
        
        // Allow operation change without computation
        if (this.currentOperand === '' && this.previousOperand !== '') {
            this.operation = operation;
            return;
        }
        
        if (this.previousOperand !== '' && !this.shouldResetDisplay) {
            this.compute();
        }
        
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.shouldResetDisplay = false;
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.showError('Cannot divide by zero!');
                    return;
                }
                computation = prev / current;
                break;
            case '%':
                if (current === 0) {
                    this.showError('Cannot modulo by zero!');
                    return;
                }
                computation = prev % current;
                break;
            default:
                return;
        }
        
        // Handle very large or very small numbers
        if (!isFinite(computation)) {
            this.showError('Result too large!');
            return;
        }
        
        // Round to prevent floating point errors
        computation = Math.round((computation + Number.EPSILON) * 100000000) / 100000000;
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetDisplay = true;
    }

    // ===== UTILITY METHODS =====
    showError(message) {
        // Visual error feedback
        this.currentOperandElement.style.color = '#ff6b6b';
        this.currentOperandElement.textContent = 'Error';
        
        setTimeout(() => {
            this.currentOperandElement.style.color = '';
            this.clear();
            this.updateDisplay();
        }, 1500);
        
        // Optional: Show error message
        console.warn(message);
    }

    getDisplayNumber(number) {
        if (number === '') return '';
        
        const stringNumber = number.toString();
        const [integerPart, decimalPart] = stringNumber.split('.');
        
        let integerDisplay;
        const integerDigits = parseFloat(integerPart);
        
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            // Format with commas for readability
            integerDisplay = integerDigits.toLocaleString('en', { 
                maximumFractionDigits: 0 
            });
        }
        
        if (decimalPart != null) {
            // Limit decimal places for display
            const limitedDecimal = decimalPart.slice(0, 8);
            return `${integerDisplay}.${limitedDecimal}`;
        }
        
        return integerDisplay;
    }

    updateDisplay() {
        // Update current operand display
        const displayValue = this.getDisplayNumber(this.currentOperand) || '0';
        this.currentOperandElement.textContent = displayValue;
        
        // Update previous operand display
        if (this.operation != null) {
            this.previousOperandElement.textContent = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.textContent = '';
        }
    }
}

/**
 * UI Controller - Manages DOM interactions and events
 */
class UIController {
    constructor() {
        this.initializeElements();
        this.calculator = new Calculator(
            this.previousOperandElement, 
            this.currentOperandElement
        );
        this.setupEventListeners();
        this.calculator.updateDisplay();
    }

    initializeElements() {
        this.previousOperandElement = document.getElementById('previousOperand');
        this.currentOperandElement = document.getElementById('currentOperand');
        this.numberButtons = document.querySelectorAll('[data-number]');
        this.operatorButtons = document.querySelectorAll('[data-operator]');
        this.equalsButton = document.querySelector('[data-equals]');
        this.deleteButton = document.querySelector('[data-delete]');
        this.clearButton = document.querySelector('[data-clear]');
    }

    setupEventListeners() {
        // Number buttons
        this.numberButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleNumberInput(button.textContent);
                this.addButtonFeedback(button);
            });
        });

        // Operator buttons
        this.operatorButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleOperatorInput(button.textContent);
                this.addButtonFeedback(button);
            });
        });

        // Special buttons
        this.equalsButton.addEventListener('click', (e) => {
            this.handleEqualsInput();
            this.addButtonFeedback(this.equalsButton);
        });

        this.clearButton.addEventListener('click', (e) => {
            this.handleClearInput();
            this.addButtonFeedback(this.clearButton);
        });

        this.deleteButton.addEventListener('click', (e) => {
            this.handleDeleteInput();
            this.addButtonFeedback(this.deleteButton);
        });
    }

    // ===== INPUT HANDLERS =====
    handleNumberInput(number) {
        this.calculator.appendNumber(number);
        this.calculator.updateDisplay();
    }

    handleOperatorInput(operator) {
        this.calculator.chooseOperation(operator);
        this.calculator.updateDisplay();
    }

    handleEqualsInput() {
        this.calculator.compute();
        this.calculator.updateDisplay();
    }

    handleClearInput() {
        this.calculator.clear();
        this.calculator.updateDisplay();
    }

    handleDeleteInput() {
        this.calculator.delete();
        this.calculator.updateDisplay();
    }

    // ===== VISUAL FEEDBACK =====
    addButtonFeedback(button) {
        button.style.transform = 'translateY(-1px) scale(0.98)';
        button.style.transition = 'all 0.1s ease';
        
        setTimeout(() => {
            button.style.transform = '';
            button.style.transition = '';
        }, 150);
    }

    findButtonByContent(content) {
        return Array.from(document.querySelectorAll('.btn')).find(
            btn => btn.textContent === content
        );
    }

    addKeyboardFeedback(key) {
        let button = null;
        
        // Map keys to buttons
        if (key >= '0' && key <= '9' || key === '.') {
            button = this.findButtonByContent(key);
        } else {
            const keyMap = {
                '+': '+', '-': '-', '*': '×', '/': '÷', '%': '%',
                'Enter': '=', '=': '=',
                'Escape': 'AC', 'c': 'AC', 'C': 'AC',
                'Backspace': '⌫', 'Delete': '⌫'
            };
            
            const mappedKey = keyMap[key];
            if (mappedKey) {
                button = this.findButtonByContent(mappedKey);
            }
        }
        
        if (button) {
            this.addButtonFeedback(button);
        }
    }
}

/**
 * Keyboard Controller - Handles keyboard input and shortcuts
 */
class KeyboardController {
    constructor(uiController) {
        this.uiController = uiController;
        this.setupKeyboardListeners();
    }

    setupKeyboardListeners() {
        document.addEventListener('keydown', (event) => {
            this.handleKeyPress(event);
        });
    }

    handleKeyPress(event) {
        const key = event.key;
        
        // Prevent default browser behaviors for specific keys
        if (key === '/' || key === 'Enter') {
            event.preventDefault();
        }
        
        // Handle different key types
        if (this.isNumberKey(key)) {
            this.uiController.handleNumberInput(key);
        } else if (this.isOperatorKey(key)) {
            this.uiController.handleOperatorInput(this.mapOperatorKey(key));
        } else if (this.isEqualsKey(key)) {
            this.uiController.handleEqualsInput();
        } else if (this.isClearKey(key)) {
            this.uiController.handleClearInput();
        } else if (this.isDeleteKey(key)) {
            this.uiController.handleDeleteInput();
        }
        
        // Add visual feedback
        this.uiController.addKeyboardFeedback(key);
    }

    // ===== KEY TYPE CHECKERS =====
    isNumberKey(key) {
        return (key >= '0' && key <= '9') || key === '.';
    }

    isOperatorKey(key) {
        return ['+', '-', '*', '/', '%'].includes(key);
    }

    isEqualsKey(key) {
        return key === 'Enter' || key === '=';
    }

    isClearKey(key) {
        return key === 'Escape' || key.toLowerCase() === 'c';
    }

    isDeleteKey(key) {
        return key === 'Backspace' || key === 'Delete';
    }

    mapOperatorKey(key) {
        const operatorMap = {
            '*': '×',
            '/': '÷',
            '+': '+',
            '-': '-',
            '%': '%'
        };
        return operatorMap[key] || key;
    }
}

/**
 * Application Initializer
 */
class CalculatorApp {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    start() {
        // Initialize UI Controller
        this.uiController = new UIController();
        
        // Initialize Keyboard Controller
        this.keyboardController = new KeyboardController(this.uiController);
        
        // Add any additional initialization here
        this.addLoadingAnimation();
        
        console.log('🧮 Glassmorphism Calculator initialized successfully!');
    }

    addLoadingAnimation() {
        const calculator = document.querySelector('.calculator');
        if (calculator) {
            calculator.style.opacity = '0';
            calculator.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                calculator.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                calculator.style.opacity = '1';
                calculator.style.transform = 'translateY(0)';
            }, 100);
        }
    }
}

// ===== APPLICATION STARTUP =====
const calculatorApp = new CalculatorApp();
