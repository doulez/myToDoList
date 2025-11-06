function _createModal(){
    let modal = document.createElement('div');
    modal.classList.add('modal');
    modal.insertAdjacentHTML("afterbegin",`
            <div class="modal__overlay" data-close="true"> <!--Затемнение для всего контента-->
                <div class="modal__window">
                    <div class="modal__header">
                        <h1 class="modal__title">New Note</h1>
                    </div>
                    <div class="modal__body">
                        <input type="text" class="modal__input" placeholder="Input your note...">
                    </div>
                    <div class="modal__footer">
                        <button class="btn btn--cancel" data-close="true">Cancel</button>
                        <button class="btn btn--apply">Apply</button>
                    </div>
                </div>
            </div>
    `)
    document.body.append(modal)
    return modal;
}

$.modal = function(){
    const ANIMATION_SPEED = 200
    let closing = false
    let destroyed = false;
    $modal = _createModal();
    const modal_method = {
        open(){
            if(destroyed){
                return console.log("Modal is destroyed")
            }
            !closing && $modal.classList.add('open')
        },
        close(){
            closing = true
            $modal.classList.remove('open')
            $modal.classList.add('hide');
            setTimeout(()=>{
                $modal.classList.remove('hide');
                closing = false
            },ANIMATION_SPEED)
        }
    }

    const listener = (e) =>{
        if(e.target.dataset.close){
            modal_method.close();
        }
    }

    $modal.addEventListener('click',listener)
    
    return Object.assign(modal_method, {
        destroy(){
            $modal.parentNode.removeChild($modal);
            $modal.removeEventListener('click', listener)
            destroyed = true;
        }
    })
}