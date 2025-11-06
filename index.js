const myModal = $.modal();

const mainListEl = document.querySelector('.list__container');

//Наведение на кнокпи редактирования
function isActive(e,opacity){
const itemEl = e.target.closest('.item');
    if (itemEl) {
        const iconActionEl = itemEl.querySelector('.item-action');
        if (iconActionEl) {
            if (opacity === '0' && itemEl.dataset.editing) {
                return; 
            }
            iconActionEl.style.opacity = opacity;
        }
    }
}
mainListEl.addEventListener('mouseover', (e)=>isActive(e,'1'));
mainListEl.addEventListener('mouseout', (e)=>isActive(e,'0'));


//Показ/скрытие кнопок в item
const findButton = (item, isEditing)=>{
    const buttonEditorEl = item.querySelector('.item-action__button--editor');
    const buttonTrashEl = item.querySelector('.item-action__button--trash');
    const buttonMarkEl = item.querySelector('.item-action__button--mark');
    const buttonCrossEl = item.querySelector('.item-action__button--cross');
    
    if(isEditing) {
        if(buttonMarkEl && buttonCrossEl){
            buttonMarkEl.classList.remove('item-action__button--hidden');
            buttonCrossEl.classList.remove('item-action__button--hidden');
        }
        buttonEditorEl.classList.add('item-action__button--hidden');
        buttonTrashEl.classList.add('item-action__button--hidden');
    } else {
        if(buttonMarkEl && buttonCrossEl){
            buttonMarkEl.classList.add('item-action__button--hidden');
            buttonCrossEl.classList.add('item-action__button--hidden');
        }
        buttonEditorEl.classList.remove('item-action__button--hidden');
        buttonTrashEl.classList.remove('item-action__button--hidden');
    }
}

//Блокировка редактирования
const resetAllEditing = () => {
    const allEditingEl = mainListEl.querySelectorAll('.item[data-editing]');
    allEditingEl.forEach(item => {
        let note = item.querySelector('.item__note');
        let originalValue = note.getAttribute('value');
        note.value = originalValue;
        note.setAttribute('readonly', 'true');
        item.removeAttribute('data-editing');
        findButton(item, false);
    });
}

//Разрешение на редактирование
const isEditingNote = (item)=>{
    if(item.hasAttribute('data-editing')){
        let note = item.querySelector('.item__note');
        let noteValue = note.getAttribute('value');
        note.removeAttribute('readonly')
        noteValue = note.value
        note.setAttribute('value',noteValue); 
        note.focus();
        setTimeout(() => {
            note.setSelectionRange(note.value.length, note.value.length);
        }, 10);
        findButton(item, true);
    }
}

//Показ кнопки отмены
const activeUndoButton = (item)=>{
        const buttonUndo = document.querySelector('.undo');
        const deletedItem = item;
        const parent = item.parentNode;
        const nextSibling = item.nextElementSibling;
        
        item.remove();
        updateTotalTask()
        buttonUndo.classList.add('active');
        
        let count = 5;
        let undoTime = buttonUndo.querySelector('.timer__sec');
        undoTime.textContent = count;

        const undoHandler = () => {
            if (nextSibling) {
                nextSibling.before(deletedItem);
                updateTotalTask()
            }else{
                parent.append(deletedItem)
            }
            clearInterval(timerId);
            buttonUndo.classList.remove('active');
            buttonUndo.removeEventListener('click', undoHandler);
        };
        
        buttonUndo.addEventListener('click', undoHandler);

        let timerId = setInterval(() => {
            count--;
            undoTime.textContent = count;
            if (count <= 0) {
                clearInterval(timerId);
                buttonUndo.classList.remove('active');
                buttonUndo.removeEventListener('click', undoHandler);
            }
        }, 1000);
}

//Нажатие кнопок внутри заметки
const clickButtonInItem = (e)=> {
    let itemEl = e.target.closest('.item');
    let buttonEditorEl = e.target.closest('.item-action__button--editor'); 

    let buttonTrashEl = e.target.closest('.item-action__button--trash');

    let ButtonMarkEl = e.target.closest('.item-action__button--mark');
    let buttonCrossEl = e.target.closest('.item-action__button--cross');

    //Редактирование заметки
    if(buttonEditorEl){
        resetAllEditing();
        itemEl.setAttribute('data-editing','true');
        isEditingNote(itemEl);
        if(itemEl.classList.contains('item__note--checked')){
            itemEl.classList.remove('item__note--checked')
        }
    }

    //Удаление заметки
    if (buttonTrashEl) {
        activeUndoButton(itemEl)
    }

    //Сохранение изменение заметки
    if(ButtonMarkEl){
        isEditingNote(itemEl);
        let note = itemEl.querySelector('.item__note');
        note.setAttribute('readonly', 'true');
        itemEl.removeAttribute('data-editing');
        findButton(itemEl, false);
        let isChecked = e.target.closest('.checkbox-input-hidden');
        if(isChecked.hasAttribute('checked')){
            itemEl.classList.add('item__note--checked')
        }
    }

    //Отмена изменений у заметки
    if(buttonCrossEl){
        let isChecked = itemEl.querySelector('.checkbox-input-hidden');
        resetAllEditing();
        if(!itemEl.classList.contains('item__note--checked') && isChecked.hasAttribute('checked')){
            itemEl.classList.add('item__note--checked')
        }
    }

    // Активация/деактивация заметки
    if(e.target.closest('.item__note')){
    let isChecked = itemEl.querySelector('.checkbox-input-hidden')
    if(!itemEl.classList.contains('item__note--checked')){
        console.log('Добавил зачеркивание по тексту')
        isChecked.setAttribute('checked','true')
        itemEl.classList.add('item__note--checked');
        console.log(isChecked.hasAttribute('checked'))
    }else{
        console.log('Удалил зачеркивание по тексту')
        isChecked.removeAttribute('checked')
        itemEl.classList.remove('item__note--checked');
        console.log(!isChecked.hasAttribute('checked'))
    }

    console.log(isChecked)
    }

    if(e.target.closest('.checkbox-input-hidden')){
        if(!e.target.hasAttribute('checked')){
            e.target.setAttribute('checked','true');
        }else{
            e.target.removeAttribute('checked')
        }
        if(e.target.hasAttribute('checked')){
            console.log("добавил зачеркивание по чекбоксу")
            itemEl.classList.add('item__note--checked');
        }else{
            console.log("удалил зачеркивание по чекбоксу")
            itemEl.classList.remove('item__note--checked');
        }
    }
    //При нажатии сначала на чекбокс а потом на текст начинает ломаться логика(ошибка возможна в том что isChecked ищем через querySelector)
}
mainListEl.addEventListener('click', clickButtonInItem);

//Проверка на пустоту заметок
function checkEmptyState() {
    let empty = document.querySelector('.empty');
    let visibleItems = Array.from(mainListEl.children).filter(item => 
        item.style.display !== 'none'
    );
    
    if(visibleItems.length === 0) {
        mainListEl.style.display = 'none';
        empty.style.display = 'flex';
        updateTotalTask(visibleItems.length)
    } else {
        mainListEl.style.display = 'block';
        empty.style.display = 'none';
        updateTotalTask(visibleItems.length)
    }
}

//Поиск заметок
const headInputSearch = document.querySelector('.search__input');
headInputSearch.addEventListener('input', (e) => {
    const searchText = e.target.value.toLowerCase();
    for(let i = 0; i < mainListEl.children.length; i++) {
        const noteElement = mainListEl.children[i].querySelector('.item__note');
        const noteText = noteElement.value.toLowerCase();
        if(noteText.includes(searchText)) {
            mainListEl.children[i].style.display = 'flex';
        } else {
            mainListEl.children[i].style.display = 'none';
        }
        checkEmptyState();
    }
});

//Кнопка для открытия модального окна
const btnAddEl = document.querySelector('.button-add-note');
btnAddEl.addEventListener('click', ()=>{
    myModal.open();
})

//Добавление заметки в лист
const btnApply = document.querySelector('.btn--apply');
let itemCounter = 4;
btnApply.addEventListener('click',()=>{
    let inputEl = document.querySelector('.modal__input');
    mainListEl.insertAdjacentHTML("afterbegin",`
        <div class="item">
                    <div class="item__checkbox checkbox">
                        <input type="checkbox" class="checkbox-input-hidden" id="checkbox-input-${itemCounter}">
                        <label for="checkbox-input-${itemCounter}" class="checkbox-input"></label>
                    </div>
                    <input type="text" class="item__note"  value="${inputEl.value}" readonly>
                    <div class="item-action">
                        <button class="item-action__button item-action__button--editor">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.67272 5.99106L2 12.6637V16H5.33636L12.0091 9.32736M8.67272 5.99106L11.0654 3.59837L11.0669 3.59695C11.3962 3.26759 11.5612 3.10261 11.7514 3.04082C11.9189 2.98639 12.0993 2.98639 12.2669 3.04082C12.4569 3.10257 12.6217 3.26735 12.9506 3.59625L14.4018 5.04738C14.7321 5.37769 14.8973 5.54292 14.9592 5.73337C15.0136 5.90088 15.0136 6.08133 14.9592 6.24885C14.8974 6.43916 14.7324 6.60414 14.4025 6.93398L14.4018 6.93468L12.0091 9.32736M8.67272 5.99106L12.0091 9.32736" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button class="item-action__button item-action__button--trash">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3.87414 7.61505C3.80712 6.74386 4.49595 6 5.36971 6H12.63C13.5039 6 14.1927 6.74385 14.1257 7.61505L13.6064 14.365C13.5463 15.1465 12.8946 15.75 12.1108 15.75H5.88894C5.10514 15.75 4.45348 15.1465 4.39336 14.365L3.87414 7.61505Z"/>
                                <path d="M14.625 3.75H3.375" stroke-linecap="round"/>
                                <path d="M7.5 2.25C7.5 1.83579 7.83577 1.5 8.25 1.5H9.75C10.1642 1.5 10.5 1.83579 10.5 2.25V3.75H7.5V2.25Z"/>
                                <path d="M10.5 9V12.75" stroke-linecap="round"/>
                                <path d="M7.5 9V12.75" stroke-linecap="round"/>
                            </svg>    
                        </button>
                        <button class="item-action__button item-action__button--mark item-action__button--hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="blue">
                                <path d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z"/>
                            </svg>
                        </button>
                        <button class="item-action__button item-action__button--cross item-action__button--hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="red"><path d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z"/></svg>
                        </button>
                    </div>
                </div>  
    `)
    itemCounter++;
    myModal.close();
    updateTotalTask()
    checkEmptyState()
})


//Отмена добавления заметки/закрытие модального окна
const btnCancel = document.querySelector('.btn--cancel');
btnCancel.addEventListener('click', ()=>{
    myModal.close();
})


//Поиск задач по селекту
const selectButton = document.querySelector('.select__button');
const selectList = document.querySelector('.select__list')

//Показ/скрытие options элементов
selectButton.addEventListener('click', ()=>{
    selectButton.classList.add('select__button--active')
    selectList.classList.toggle('select__list--visible')
})

let currentFilter = 'all'; 

//Замена текст у селекта и обновление состояния задач
const selectItem = document.querySelectorAll('.select__item');
selectItem.forEach((item)=>{
    item.addEventListener('click',function(e){
        e.stopPropagation();
        currentFilter = item.dataset.value;
        console.log(currentFilter)
        applyFilter();
        selectButton.textContent = this.textContent;
        const input = document.querySelector('.select__input--hidden');
        input.value = this.dataset.value;
        selectList.classList.remove('select__list--visible')
    })
})

//Обновляет состояние задач
function applyFilter() {
    for(let i = 0; i < mainListEl.children.length; i++) {
        const itemEl = mainListEl.children[i];
        let isChecked = itemEl.querySelector('.checkbox-input-hidden');
        
        if(currentFilter === 'all'){
            itemEl.style.display = 'flex';
        }
        else if(currentFilter === 'complete') {
            if(isChecked.hasAttribute('checked')) {
                itemEl.style.display = 'flex';
            } else {
                itemEl.style.display = 'none';
            }
        }
        else if(currentFilter === 'incomplete') {
            if(!isChecked.hasAttribute('checked')) {
                itemEl.style.display = 'flex';
            } else {
                itemEl.style.display = 'none';
            }
        }
    }
    checkEmptyState();
}

//Обработчик для отслеживания изменений выполнено/невыполнено с исчезновением
mainListEl.addEventListener('change', (e) => {
    if(e.target.classList.contains('checkbox-input-hidden')) {
        const itemEl = e.target.closest('.item');
        const isChecked = e.target.hasAttribute('checked');
            if(currentFilter === 'complete' && !isChecked) {
            setTimeout(() => {
                    itemEl.style.display = 'none';
                    checkEmptyState();
            }, 1000);
        }
        else if(currentFilter === 'incomplete' && isChecked) {
            setTimeout(() => { 
                    itemEl.style.display = 'none';
                    checkEmptyState();
            }, 1000);
        }
        checkEmptyState();
    }
});

document.addEventListener('click',  e => {
    if(e.target !== selectButton){
        selectButton.blur();
        selectList.classList.remove('select__list--visible')
    }
})

document.addEventListener('keydown',function(e){
    if(e.key === 'Tab' || e.key === 'Escape'){
        selectButton.blur();
        selectList.classList.remove('select__list--visible')
    }
})

//Смена темы
const buttonScheme = document.querySelector('.scheme-button');
buttonScheme.addEventListener('click',()=>{
    document.body.classList.toggle('dark')
})

//Показ количества задач на странице
function updateTotalTask(length = mainListEl.children.length){
    const total = document.querySelector('.total')
    const totalText = total.querySelector('.total__task');
    const totalTask = length;
    if(length == 0){
        total.style.display = 'none'
    }else{
        total.style.display = 'flex'
    }
    totalText.textContent = `Total Task ${totalTask}`
}
updateTotalTask()


//Удаление всех задач
const buttonDelete = document.querySelector('.total__button');
function deleteAllTask(){
    for(let i = mainListEl.children.length-1; i >= 0; i--){
        mainListEl.children[i].remove()
    }
    checkEmptyState()
    updateTotalTask()
}
buttonDelete.addEventListener('click', deleteAllTask)