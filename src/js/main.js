//const surveycakeURL = 'https://www.surveycake.com/'
//const sendDataURL = 'https://www.TEST.com/POST/API'

//頁面紀錄 從localStorage取得deegooq_current_page的頁面資料
//let currentPage = 'start'


/*
if(window.localStorage.getItem('deegooq_current_page')){
    currentPage = window.localStorage.getItem('deegooq_current_page')
    console.log('deegooq_current_page', currentPage)
}*/

//currentPage = 'Q4-2'

//使用者資料 從localStorage取得deegooq_current_page的頁面資料
if(window.localStorage.getItem('deegooq_current_data') && currentPage != 'start'){
    collectData =JSON.parse( window.localStorage.getItem('deegooq_current_data'))
    console.log('deegooq_current_page', collectData)
}


//json資料容器
let mainData={}

//讀取圖片資源管理
const loadImgManager = ()=>{
    const assetsList = ['logo.svg']
    let ct = 0
    const loadImgAssets = url =>{
        const img = new Image()
        img.src= url
        img.onload = ()=>{
            console.log(`image ${assetsList[ct]} load complete`)
            ct++
            if(ct<assetsList.length){   
                loadImgAssets(`./img/${assetsList[ct]}`)
            }else{
                console.log('load all img complete')
                document.querySelector(".loading").classList.add('off')
            }
        }
    }
    loadImgAssets(`./img/${assetsList[ct]}`)
}



//防止double tap 測試
window.onload = () => {
    document.addEventListener('touchstart', (event) => {
      if (event.touches.length > 1) {
         event.preventDefault();
      }
    }, { passive: false });
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
}

document.addEventListener('DOMContentLoaded', () => {
    
    //#region 偵測頁面方向
    const detectOrientation =  () => {
        //console.log(window.orientation )
        if(window.orientation == 90  || window.orientation == -90 ){
            document.querySelector(".app.landscape").style.display = 'flex'
            document.querySelector(".app.portrait").style.display = 'none'
        }else{
            document.querySelector(".app.landscape").style.display = 'none'
            document.querySelector(".app.portrait").style.display = 'flex'
        }
    }

    window.addEventListener('resize', detectOrientation)
    detectOrientation()
    //#endregion 

    //#region 頁面控制 套院pageBtn按鈕配合取得datasets中的ID資料即可切換頁面
    const pages = document.querySelectorAll(".page")
    const btns = document.querySelectorAll(".pageBtn")

    //關閉所有頁面
    const closeAll = () => {
        pages.forEach(page => {
            page.style.display = "none"
        })
    }
    
    const openPage = pageID =>{
        closeAll()
        document.querySelector(pageID).style.display = "flex"
    }

    //將所有的pageBtn設定click後的行為
    const setBtnsHandler = () => {
        btns.forEach(btn => {
            btn.addEventListener("click", event => {
                const pageID = event.currentTarget.dataset.id
                window.localStorage.setItem('deegooq_current_page', pageID)//設定當前頁面
                openPage(`#${pageID}`)
            })
        })
    }
    //#endregion

    //#region 資料收集器 data collector
    const setDataCollector = (key, value)=>{
        collectData = {
            ...collectData,
            [key]:value
        }
        window.localStorage.setItem('deegooq_current_data', JSON.stringify(collectData))
        console.log(collectData)
    }
    //#endregion

    //#region 讀取json設定檔
    const loadData = () => {
        fetch("./js/data.json", {
            method: 'GET'
        }).then(response => {
            if (response.ok) {
                return response.json();
            }
        }).then(res => {
            if (res) {
                return res
            } else {
                alert("取得資料失敗")
            }
        }).then(res => {
            mainData = res
            console.log(mainData)
        }).catch(error => {
            console.error('json 取得失敗:', error)
        });
    }

    //#endregion
 
    //#region 個人資料的button group
    const setButtonGroup = ()=>{
        document.querySelectorAll(".button-group").forEach(btn=>{
            btn.addEventListener("click", event=>{
                const _t = event.currentTarget
                const _g = _t.dataset.group
                const _v = _t.dataset.value
                document.querySelectorAll(`.button-group[data-group=${_g}]`).forEach(gBtn=>{
                    gBtn.classList.remove('on')
                })
                _t.classList.add('on')
                setDataCollector(_g, _v)
            })
        })
    }
    //#endregion

    const setTypeBtns=()=>{
        document.querySelectorAll(".typeBtn").forEach(btn=>{
            btn.addEventListener("click", event=>{
                console.log(event.target.dataset.type)
                openPage('#list')
            })
        })

    }

    //#region 計時器元件
    const setTimer = (ct, VID, endF)=>{
        let _ct = ct
        const timer = setInterval(()=>{
            console.log(`${VID} timer count left ${_ct}`)
            _ct--
            document.querySelector(VID).innerHTML = _ct
            if(_ct == 0){
                endF()
            }
        }, 1000);
        
        return timer
    }
    //#endregion



    //init 
    loadData()
    loadImgManager()
    closeAll()
    //document.querySelector(`#${currentPage}`).style.display = "flex"
    document.querySelector('#start').style.display = "flex"
    setBtnsHandler()
    setTypeBtns()
    //setButtonGroup()
    //pages

    let player;
    let tr 
    let trf = ()=>{ console.log("!") }

    const onYouTubeIframeAPIReady = ()=> {
        player = new YT.Player('player', {
            //height: '600', 
            //width: '370',
            //videoId: 'DmWoaB7fM5U',
            events: {
                'onReady':  e=>{
                    console.log(e)                    
                    //e.target.loadVideoById('DmWoaB7fM5U')
                },
                'onStateChange': e=>{
                    console.log(e)
                    if(e.data == 1) tr = setInterval(trf, 1000)
                    if(e.data == 2) clearInterval(tr)
                }
            }
        });
    }

    setTimeout( onYouTubeIframeAPIReady, 1000)
    
    document.querySelector("#yPlay").addEventListener('click', ()=>{
       // player.playVideo();
       player.loadVideoById('DmWoaB7fM5U') 
    })
    document.querySelector("#yStop").addEventListener('click', ()=>{
        //player.pauseVideo();    

        //player.loadVideoById('DmWoaB7fM5U') //知覺動作 
        //player.loadVideoById('OQHHP3KW6b4') //記憶力 
        //player.loadVideoById('oCHqzlUpOO')  //執行力
        //player.loadVideoById('T0PFz0PRrEs')  //專注力
        player.loadVideoById('n8hHkNLTmPE')  //語言能力
    })
})