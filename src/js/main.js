//const surveycakeURL = 'https://www.surveycake.com/'
//const sendDataURL = 'https://www.TEST.com/POST/API'

//頁面紀錄 從localStorage取得deegooq_current_page的頁面資料
//let currentPage = 'start'

/*
if(window.localStorage.getItem('deegooq_current_page')){
    currentPage = window.localStorage.getItem('deegooq_current_page')
    console.log('deegooq_current_page', currentPage)
}
*/

//currentPage = 'Q4-2'

//使用者資料 從localStorage取得deegooq_current_page的頁面資料
if(window.localStorage.getItem('deegooq_current_data') && currentPage != 'start'){
    collectData =JSON.parse( window.localStorage.getItem('deegooq_current_data'))
    console.log('deegooq_current_page', collectData)
}

//json資料容器
let mainData={}
let youPlayer;
let mesgPack=[];
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

//自定義播放器
class MyPlayer{
    YTPlayer={}
    timeCount = 0
    countAction=(time)=>{}//計時器的行為
    constructor(){
        console.log('init MyPlayer')
        setTimeout(() => {
            this.YTPlayer = new YT.Player('youPlayer', {
                events: {
                    'onReady':  e=>{
                        console.log(e)                    
                        //e.target.loadVideoById('DmWoaB7fM5U')
                    },
                    'onStateChange': e=>{
                        console.log(e)
                        if(e.data == 1) tr = setInterval(trf, 1000)
                        if(e.data == 0 || e.data == 2) clearInterval(tr)
                    }
                }
            });
        }, 1000);
    }
    setMov = id =>{
        this.timeCount = 0
        this.YTPlayer.loadVideoById(id)
    }

    trf = () => { 
        //console.log("timer count!") 
        this.timeCount = ++
        this.countAction()
       
    }
}


//防止double tap 
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

    //建立計時器
    let myPlayer = new MyPlayer()
    myPlayer.countAction =()=>{
        mesgPack.map(pack=>{
            if(pack.time == myPlayer.timeCount){
                console.log(pack.text)
            }
        })
    }
    //#region 偵測頁面方向
    const detectOrientation =  () => {
        //console.log( window.orientation )
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

    
    const clearMovList = () =>{
        const box = document.querySelector('#listBox')            
        while (box.firstChild) {
            box.removeChild(box.lastChild)
        }
    }
    
    const setBar = data  =>{
        const barBox = document.createElement('div')
        barBox.classList.add('barBox')
        data.map( value =>{
            const _b = document.createElement('div')
            _b.style.flex = `${value} 0 auto`
            barBox.appendChild(_b)
        })
        return barBox
    }

    const setMovList = type=>{
        clearMovList()
        const box = document.querySelector('#listBox')
        mainData[type].list.map(data=>{
            const row = document.createElement('div')
            const txt = document.createElement('span')
            const bar = setBar(data.bar)
            txt.innerHTML = data.title
            row.classList.add('listRow')
            row.addEventListener('click', ()=>{
                mesgPack = data.mesg
                myPlayer.setMov(data.videoId)
                openPage('#player')
            })
            row.appendChild(txt)
            row.appendChild(bar)
            box.appendChild(row)
        })
        openPage('#list')
    }
    
    const setTypeBtns=()=>{
        document.querySelectorAll(".typeBtn").forEach(btn=>{
            btn.addEventListener("click", event=>{
                const _t = event.target.dataset.type
                if(mainData[_t].list){
                    setMovList(_t)
                }
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
    let youPlayer;
    let tr 
    let ct=0
    let trf = ()=>{ 
        //console.log("timer count!") 
        ct++
        mesgPack.map(pack=>{
            if(pack.time == ct){
                console.log(pack.text)
            }
        })
    }
    /*
    const onYouTubeIframeAPIReady = ()=> {
        youPlayer = new YT.Player('youPlayer', {
            events: {
                'onReady':  e=>{
                    console.log(e)                    
                    //e.target.loadVideoById('DmWoaB7fM5U')
                },
                'onStateChange': e=>{
                    console.log(e)
                    if(e.data == 1) tr = setInterval(trf, 1000)
                    if(e.data == 0 || e.data == 2) clearInterval(tr)
                }
            }
        });
    }
    */
    //setTimeout( onYouTubeIframeAPIReady, 1000)
    
    document.querySelector("#yPlay").addEventListener('click', ()=>{
        youPlayer.playVideo();
       //youPlayer.loadVideoById('DmWoaB7fM5U') 
    })

    document.querySelector("#yStop").addEventListener('click', ()=>{
        youPlayer.pauseVideo();    
        //youPlayer.loadVideoById('DmWoaB7fM5U') //知覺動作 
        //youPlayer.loadVideoById('OQHHP3KW6b4') //記憶力 
        //youPlayer.loadVideoById('oCHqzlUpOO')  //執行力
        //youPlayer.loadVideoById('T0PFz0PRrEs')  //專注力
        //youPlayer.loadVideoById('n8hHkNLTmPE')  //語言能力
    })
    document.querySelector("#yBack").addEventListener('click', ()=>{
        youPlayer.pauseVideo();
        ct = 0
        openPage("#list")
     })
})

