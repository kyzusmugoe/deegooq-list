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
    interval = null
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
                        if(e.data == 1) this.interval = setInterval(this.intervalAction, 1000)
                        
                        if(e.data == 0 || e.data == 2) clearInterval(interval)
                    }
                }
            });
        }, 1000);
    }
    
    intervalAction =()=>{
        this.timeCount++
        this.countAction()
    }

    setMov = id =>{
        this.timeCount = 0
        this.YTPlayer.loadVideoById(id)
    }
    play = () =>{
        this.YTPlayer.playVideo();
    }
    pause=()=>{
        this.timeCount = 0
        this.YTPlayer.pauseVideo();
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
            //console.log(mainData)
            setTypeBtns()

        }).catch(error => {
            console.error('json 取得失敗:', error)
        });
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
        data.map( bar =>{            
            const _b = document.createElement('div')
            const _color = document.createElement('div')
            const _txt = document.createElement('span')
            _b.style.flex = `${bar.value} 0 auto`
            _b.classList.add('bar')
            _color.style.backgroundColor = bar.color
            _color.classList.add('colorBar')
            _txt.innerHTML = bar.txt
            _b.appendChild(_color)
            _b.appendChild(_txt)
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
            txt.classList.add('txt')
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
    
    //設置主頁按鈕
    const setTypeBtns=()=>{
        const box = document.querySelector('#typeBtnBox')
        for(let key in mainData){
            console.log(key)
            const _d = mainData[key]
            const btn = document.createElement('div')
            btn.innerHTML = _d.title
            btn.dataset.type = key
            btn.classList.add("typeBtn", key)
            btn.addEventListener("click", event=>{
                const _t = event.target.dataset.type
                if(mainData[_t].list){
                    setMovList(_t)
                }
            })
            box.appendChild(btn)
        }
    }

    //init
    closeAll()
    loadImgManager()
    loadData()
    //document.querySelector(`#${currentPage}`).style.display = "flex"
    document.querySelector('#start').style.display = "flex"
    setBtnsHandler()

    document.querySelector("#yPlay").addEventListener('click', ()=>{
        myPlayer.pause()
    })

    document.querySelector("#yStop").addEventListener('click', ()=>{
        myPlayer.pause()  
    })
    document.querySelector("#yBack").addEventListener('click', ()=>{
        myPlayer.pause()
        openPage("#list")
     })
})

