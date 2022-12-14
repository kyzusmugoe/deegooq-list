//json資料容器
let mainData={}
let youPlayer;
let mesgPack=[];

//#region 讀取圖片資源管理
const loadImgManager = ()=>{
    const assetsList = [
        'akar-icons_arrow-left.svg',
        'bg_l.jpg',
        'bg_m.jpg',
        'btn_lg.svg',
        'btn_main.svg',
        'bubble.svg',
        'chat_1.svg',
        'chat_2.svg',
        'chat_3.svg',
        'chat_4.svg',
        'chat_5.svg',
        'circle-notch-solid.svg',
        'deegooq_1.svg',
        'deegooq_2.svg',
        'deegooq_3.svg',
        'deegooq_4.svg',
        'deegooq_5.svg',
        'footer_1.svg',
        'list_bg.svg',
        'logo.svg',
        'logo_ex2.svg',
        'pleaseTurn.svg',
        'ribbon.svg',
        'timer.svg',
    ]
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
//#endregion

//#region IPAD debug用
let debuggerMesh = {}
const setDebugger = (label, value) =>{
    //let _mesg = {...debuggerMesh}
    debuggerMesh[label] = value
    let txt = ""
    for(let _val in debuggerMesh){
        txt +=`${_val}:${debuggerMesh[_val]} <br/>`
    }
    document.querySelector("#debug").innerHTML = txt
}
//#endregion

//#region 自定義播放器
class MyPlayer{
    YTPlayer={}
    timeCount = 0
    countAction=(time)=>{}//計時器的行為
    doEnd = ()=>{}//結束後行為
    interval = null
    endSw = false
    constructor(){
        console.log('init MyPlayer')
        setTimeout(() => {
            this.YTPlayer = new YT.Player('youPlayer', {
                /*playerVars: {
                    'controls': 0,
                    'modestbranding':1,
                    'autoplay':1,
                    'showinfo':0
                },*/
                videoId: 'Qtn7eOGjNJA',
                events: {
                    'onReady':  e=>{
                        console.log(e)  
                        this.YTPlayer.playVideo();                  
                        //e.target.loadVideoById('DmWoaB7fM5U')
                    },
                    'onStateChange': e=>{
                        setDebugger("MyPlayer", JSON.stringify(e.data))
                        if(e.data == 1) {
                            //this.interval = setInterval(this.intervalAction, 1000); 
                        }
                        //if(e.data == 0 || e.data == 2) clearInterval(this.interval)
                        if(e.data == 0){
                            console.log("end", this.endSw)
                            if(this.endSw){
                                this.doEnd()
                                this.endSw = false

                            }
                        }
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
        this.YTPlayer.pauseVideo();
        this.YTPlayer.mute();
    }
    play = () =>{
        this.YTPlayer.unMute();
        this.YTPlayer.playVideo();
    }
    replay = () =>{
        this.YTPlayer.unMute();
        this.YTPlayer.seekTo(0);
        this.YTPlayer.playVideo();
    }
    mute = () =>{
        this.YTPlayer.mute();
    }
    unMute = () =>{
        this.YTPlayer.unMute();
    }
    pause=()=>{
        this.timeCount = 0
        this.YTPlayer.pauseVideo();
    }
}
//#endregion

//#region 防止double tap 
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
//#endregion

document.addEventListener('DOMContentLoaded', () => {
    
    //#region 偵測頁面方向
    const detectOrientation =  () => {
        setTimeout(() => {
            
            //console.log( window.orientation )
            if(window.orientation == 90  || window.orientation == -90 ){
                document.querySelector(".app.landscape").style.display = 'flex'
                document.querySelector(".app.portrait").style.display = 'none'
            }else{
                document.querySelector(".app.landscape").style.display = 'none'
                document.querySelector(".app.portrait").style.display = 'flex'
            }
            setDebugger( "window.orientation", window.orientation)
        }, 500);
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

    //#region 建立自定義播放器物件
    let myPlayer = new MyPlayer()

    /*目前暫時沒用到影片播放時安插的訊息
    myPlayer.countAction =()=>{
        mesgPack.map(pack=>{
            if(pack.time == myPlayer.timeCount){
                console.log(pack.text)
            }
        })
    }
    */
    myPlayer.doEnd =()=>{
        openPage('#end')
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

    const setMovList = type =>{
        clearMovList()
        const box = document.querySelector('#listBox')
        const chart = document.querySelector('#characterChart')
        const end = document.querySelector('#endChatBox')
        const backListBtn = document.querySelector("#backList")
        
        //let prepareToPlay = 5 
        const gotoPlay = ()=>{
            myPlayer.unMute()
            myPlayer.replay()//重新開始播放
            //openPage('#player')
        }

        const showBakBtn = ()=>{
            backListBtn.classList.add('show')
            setTimeout(() => {
                backListBtn.classList.remove('show')
            }, 7000);
        }
        //列表的腳色切換
        chart.className = "";
        chart.classList.add(type)
        //結束畫面的腳色切換
        end.className = "";
        end.classList.add(type)
        //清單按鈕
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
                myPlayer.mute()
                openPage('#player')
                //openPage('#count')
                //myPlayer.play()//先播放，避免看到標頭

                //count()
                //gotoPlay()
                myPlayer.endSw = true
                console.log(myPlayer.endSw)

                document.querySelector("#count").style.display= 'flex'                
                setTimeout(()=>{
                    myPlayer.replay()
                    gotoPlay()
                    setTimeout(()=>{
                        document.querySelector("#count").style.display= 'none'                
                    }, 200)
                }, 5400)
            })
            row.appendChild(txt)
            row.appendChild(bar)
            box.appendChild(row)
        })
        
        //點擊影片播放的地方，顯示回上頁按鈕
        showBakBtn()
        document.querySelector("#clickToShowBtn").addEventListener('click', ()=>{
            showBakBtn()
        })

        //播放畫面的回上頁按鈕控制
        backListBtn.addEventListener('click', ()=>{
            myPlayer.pause()
            myPlayer.mute()
            openPage("#list")
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

    
})

