let webSocket, globalData = {}, selectedData = {}

function onNSChanged(val){
    console.log('val', val)
    selectedData.ns = val
    const app = Object.keys(globalData[val])[0]
    selectedData.app = app
    const pod = Object.keys(globalData[val][app])[0]
    selectedData.pod = pod
    onSelectedChanged()
}

function onAppChanged(val){
    console.log('val', val)
    selectedData.app = val
    const pod = Object.keys(globalData[selectedData.ns][val])[0]
    selectedData.pod = pod
    onSelectedChanged()
}

function onPodChanged(val){
    console.log('val', val)
    selectedData.pod = val
}

function onSelectedChanged(){
    console.log('globalData', globalData)
    refreshSelector('#ns_selector', globalData, selectedData.ns, '命名空间')
    if(selectedData.ns){
        refreshSelector('#app_selector', globalData[selectedData.ns], selectedData.app, '应用')
        if(selectedData.pod){
            refreshSelector('#pod_selector', globalData[selectedData.ns][selectedData.app], selectedData.pod, '实例')
        }
    }
}

function refreshSelector(selector, data, currVal, defaultOpt){
    console.log(selector, data, currVal)
    const opts = []
    Object.keys(data).forEach(key => {
        opts.push(`<option value="${key}" ${key === currVal?'selected':''}>${key}</option>`)
    })
    if(!opts.length){
        opts.push(`<option >${defaultOpt}</option>`)
    }
    $(selector).html(opts.join('\n'))
}

$(document).ready(function () {

    let CreateWebSocket = (function () {
        return function (urlValue) {
            if (window.WebSocket) return new WebSocket(urlValue);
            if (window.MozWebSocket) return new MozWebSocket(urlValue);
            return false;
        }
    })()

    function startSocket() {
        if(webSocket){
            closeSocket()
            alert('正在关闭连接')
        }


        if (!selectedData.ns || !selectedData.pod) {
            alert('是不是还没选择实例')
            return
        }

        // 实例化websoscket websocket有两种协议ws(不加密)和wss(加密)
        webSocket = CreateWebSocket(`ws://${document.location.host}/logs?ns=${selectedData.ns}&pod=${selectedData.pod}`)

        webSocket.onopen = (event) => {
            console.log('onopen', event)
            // webSocket.send("第一条数据")
            $("#log-container div").append('<br/><span style="color: #d3d3d3; ">数据流已开启</span><br/>')

            $('.startBtn').attr('disabled', true)
            $('.stopBtn').attr('disabled', false)
        }

        // 关闭连接
        webSocket.onclose = function (evt) {
            console.log("Connection closed.")
            $("#log-container div").append('<br/><span style="color: #d3d3d3; ">数据流已关闭</span><br/>')

            $('.startBtn').attr('disabled', false)
            $('.stopBtn').attr('disabled', true)
        }

        webSocket.onmessage = (event) => {
            console.log('recv data', event.data)
            // 接收服务端的实时日志并添加到HTML页面中
            $("#log-container div").append(event.data.replace(/\n/g, '<br/>'));
            // 滚动条滚动到最低部
            $("#log-container").scrollTop($("#log-container div").height() - $("#log-container").height());
        };
    }

    function closeSocket() {
        if (webSocket) {
            webSocket.close()
            webSocket = null
        }
    }

    $('.startBtn').bind('click', startSocket)
    $('.stopBtn').bind('click', closeSocket)
    $('.clearLog').bind('click', () => {
        $("#log-container div").html('');
    })
    $('.stopBtn').attr('disabled', true)

    function refreshData(podsData) {
        globalData = {}
        podsData.forEach(item => {
            if(!globalData[item.namespace]){
                globalData[item.namespace] = {}
            }
            if(!globalData[item.namespace][item.app]){
                globalData[item.namespace][item.app] = {}
            }
            if(!globalData[item.namespace][item.app][item.pod]){
                globalData[item.namespace][item.app][item.pod] = item.pod
            }
        })

        podsData.forEach(item => {
            if(!globalData[item.namespace]){
                globalData[item.namespace] = {}
            }
        })

        if(!selectedData.ns){
            selectedData.ns = Object.keys(globalData)[0]
        }
        if(!selectedData.app){
            selectedData.app = Object.keys(globalData[selectedData.ns])[0]
        }
        if(!selectedData.pod){
            selectedData.pod = Object.keys(globalData[selectedData.ns][selectedData.app])[0]
        }
        onSelectedChanged()
    }


    $.get("infos",(data, status)=>{
        refreshData(data)
        // $('#ns_selector').html('<option selected>命名空间</option>')
    })

});

