"use strict";
(function(){
    const start_screen = document.getElementById("start-screen");
    const start_button = document.getElementById("start-screen-buttons-start-button");
    
    /** @type {HTMLCanvasElement} */
    const canvas_left = document.getElementById("canvas-left");
    
    /**@type {CanvasRenderingContext2D} */
    const context_left = canvas_left.getContext("2d");
    
    let info = {
        "width":window.innerWidth*0.4,
        "height":window.innerHeight*0.6
    };
    
    let contextmenu = {
        "x":0,
        "y":0
    };

    let selectedState;

    start_button.addEventListener("click",()=>{
        start_screen.remove();

        [document.getElementById("left-panel"),document.getElementById("right-panel"),document.getElementById("canvas-right-panel")].forEach((panel)=>{
            panel.style.width = info.width + "px";
            panel.style.height = info.height + "px";
            panel.style.display = "flex";
        });

        document.querySelectorAll("#up-panels div").forEach(panel=>{
            panel.style.width = info.width + "px";
        });
        
        document.getElementById("canvases").style.display = "flex";
        document.getElementById("up-panels").style.display = "flex";
        document.getElementById("up-left").style.display = "flex";
        document.getElementById("up-right").style.display = "flex";

        document.querySelectorAll("canvas").forEach((/** @type {HTMLCanvasElement} */canvas)=>{
            canvas.width = info.width;
            canvas.height = info.height;
            canvas.style.border = "1px solid black";
            canvas.style.borderRadius = "0.4em";
            canvas.style.boxShadow = "0 0 10px 0 rgba(0, 0, 0, 0.5)";
        });

        info.top = canvas_left.getBoundingClientRect().top;
        info.left = canvas_left.getBoundingClientRect().left;
    });

    canvas_left.addEventListener("contextmenu",(event)=>{
        if(document.querySelector(".contextmenu")){
            document.querySelector(".contextmenu ul").removeEventListener("click",contextmenufunc);
            document.querySelector(".contextmenu").remove();
        }

        selectedState = selectedNode(event.clientX,event.clientY);

        contextmenu.x = event.clientX;
        contextmenu.y = event.clientY;

        let contextmenu_context;
        if(nfa.Q.length==0 && selectedNode(contextmenu.x,contextmenu.y) == -1 && nfa.T.length == 0){
            contextmenu_context=`<li cmno="1">Add State</li>`;
        }
        else if((nfa.Q.length > 0 || nfa.T.length > 0) && selectedNode(contextmenu.x,contextmenu.y) == -1){
            contextmenu_context=`
                <li cmno="1">Add State</li>
                <li cmno="2">Clear</li>
            `;
        }
        else if(selectedNode(contextmenu.x,contextmenu.y) != -1){
            contextmenu_context=`
                <li cmno="3">Add transition</li>
                <li cmno="4">Set as start state</li>
                <li cmno="5">Set as accept state</li>
                <li cmno="6">Delete this state</li>
            `;
        }

        document.body.insertAdjacentHTML("beforeend",`    
        <div class="contextmenu" style="top:${event.clientY}px;left:${event.clientX}px;user-select:none;cursor:pointer;">
            <ul>
                ${contextmenu_context}
            </ul>
        </div>`
        );
        document.querySelector(".contextmenu ul").addEventListener("click",contextmenufunc);
    });

    canvas_left.addEventListener("click",(event)=>{
        if(document.querySelector(".contextmenu")){
            document.querySelector(".contextmenu ul").removeEventListener("click",contextmenufunc);
            document.querySelector(".contextmenu").remove();
        }    
    });
    
    canvas_left.addEventListener("mousedown",(event)=>{
        selectedState = selectedNode(event.clientX,event.clientY);
        if(selectedState!=-1)
            canvas_left.addEventListener("mousemove",dragNode);
    });

    try{
        canvas_left.addEventListener("mouseleave",()=>{
            canvas_left.removeEventListener("mousemove",dragNode);
        });

        canvas_left.addEventListener("mouseup",()=>{
            canvas_left.removeEventListener("mousemove",dragNode);

         });
    }
    catch(err){
    }

    function dragNode(event){
        selectedState.x = event.clientX-info.left;
        selectedState.y = event.clientY-info.top;
        drawCanvas();
    }

    function selectedNode(x,y){
        for(let i of nfa.Q){
            if(distance(x-info.left,y-info.top,i.x,i.y)<=i.radius){
                return i
            }
        }
        return -1;
    }

    function contextmenufunc(event){
        document.querySelector(".contextmenu ul").removeEventListener("click",contextmenufunc);
        document.querySelector(".contextmenu").remove();
        switch(event.target.getAttribute("cmno")){
            case "1":
                getWord(contextmenu.x-info.left,contextmenu.y-info.top);
                break;
            case "2":
                clearCanvas();
                clear();
                break;
            case "3":
                addTransition(selectedState);
                break;
            case "4":
                setStartState();
                break;
            case "5":
                setAcceptState();
                break;
            case "6":
                deleteState();
                break;                
        }
    }

    let nfa={
        "Q":[],
        "T":[]
    };

    class State{
        constructor(x,y,text="-",radius=info.width/20,isStartState=false,isAcceptState=false,line_color="black",background_color="transparent"){
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.line_color = line_color;
            this.background_color = background_color;
            this.text = text;
            this.isStartState = isStartState;
            this.isAcceptState = isAcceptState;
        }

        draw(){
            context_left.beginPath();
            context_left.fillStyle = this.background_color;
            context_left.strokeStyle = this.line_color;
            context_left.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
            context_left.fill();
            context_left.stroke();
            context_left.closePath();

            context_left.fillStyle = "black";
            context_left.font = `2em Arial`;
            context_left.textAlign="center";
            context_left.textBaseline="middle";
            context_left.fillText(this.text,this.x,this.y);

            if(this.isStartState){
                context_left.font = "1em Arial";
                context_left.lineCap = "round";
                context_left.beginPath();
                context_left.moveTo(this.x-(this.radius+30),this.y);
                context_left.lineTo(this.x-(this.radius+5),this.y);
                context_left.lineTo(this.x-(this.radius+5)-5,this.y-3);
                context_left.moveTo(this.x-(this.radius+5),this.y);
                context_left.lineTo(this.x-(this.radius+5)-5,this.y+3);

                context_left.stroke();
            }

            if(this.isAcceptState){
                context_left.beginPath();
                context_left.fillStyle = this.background_color;
                context_left.strokeStyle = this.line_color;
                context_left.arc(this.x,this.y,this.radius-5,0,Math.PI*2,false);
                context_left.fill();
                context_left.stroke();
                context_left.closePath();
            }
        }
    }

    class Transition{
        constructor(from,to,text){
            this.from = from;
            this.to = to;
            this.text = text;
        }

        draw(){
            context_left.beginPath();
            context_left.fillStyle = "black"
            context_left.strokeStyle = "black";
            context_left.moveTo(this.from.x,this.from.y);
            context_left.lineTo(this.to.x,this.to.y);
            context_left.lineTo(this.to.x-5,this.to.y-3);
            context_left.moveTo(this.to.x,this.to.y);
            context_left.lineTo(this.to.x-5,this.to.y+3);
            context_left.stroke();
            context_left.font = "1em Arial";
            let temp;
            if(this.text==="é")
                temp = '\u03B5';
            else
                temp = this.text; 
            context_left.fillText(temp,(this.from.x+this.to.x)/2,(this.from.y+this.to.y)/2);
        }
    }

    function getWord(a,b){
        document.body.insertAdjacentHTML("beforeend",`
        <div id="prompt">
            INSERT NAME
        </div>
        `);
        document.addEventListener("keypress",promptKeyPress);
        function promptKeyPress(event){
            if(event.keyCode >= "0".charCodeAt(0) && event.keyCode <= '9'.charCodeAt(0) || event.keyCode >= 'a'.charCodeAt(0) && event.keyCode <= 'z'.charCodeAt(0) || event.keyCode >= 'A'.charCodeAt(0) && event.keyCode <= 'Z'.charCodeAt(0)){
                let temp = new State(a,b,event.key);
                addState(temp);
                document.removeEventListener("keypress",promptKeyPress);
                document.getElementById("prompt").remove();
            }
        }
    }

    function addState(state){
        nfa.Q.push(state);
        drawCanvas();
    }

    function distance(ax,ay,bx,by){
        return Math.sqrt((ax-bx)**2+(ay-by)**2);
    }
    
    function clearCanvas(){
        context_left.clearRect(0,0,info.width,info.height);
    }

    function clear(){
        nfa ={
            "Q":[],
            "T":[]
        };
        formal(nfa);
    }

    function drawCanvas(){
        clearCanvas();
        nfa.Q.forEach(state=>{
            state.draw();
        });
        nfa.T.forEach(transition=>{
            transition.draw();
        });
        formal(nfa);
    }

    function addTransition(from){
        document.body.insertAdjacentHTML("beforeend",`
        <div id="prompt">
            SELECT OTHER STATE
        </div>
        `);
        canvas_left.addEventListener("click",clickOtherNode);
        function clickOtherNode(event){
            let temp = selectedNode(event.clientX,event.clientY);
            if(temp!=-1){
                document.getElementById("prompt").remove();
                document.body.insertAdjacentHTML("beforeend",`
                <div id="prompt">
                    INSERT NAME
                </div>
                `);
                document.addEventListener("keypress",promptKeyPress);
                function promptKeyPress(event){
                    if(event.keyCode >= "0".charCodeAt(0) && event.keyCode <= '9'.charCodeAt(0) || event.keyCode >= 'a'.charCodeAt(0) && event.keyCode <= 'z'.charCodeAt(0) || event.keyCode >= 'A'.charCodeAt(0) && event.keyCode <= 'Z'.charCodeAt(0) || event.keyCode == 'é'.charCodeAt(0)){
                        temp = new Transition(from,temp,event.key);
                        nfa.T.push(temp);
                        drawCanvas();
                        document.removeEventListener("keypress",promptKeyPress);
                        document.getElementById("prompt").remove();
                    }
                }
            }
            canvas_left.removeEventListener("click",clickOtherNode);
        }
    }

    function setStartState(){
        for(let i of nfa.Q){
            if(i.isStartState){
                i.isStartState = false;
                break;
            }
        }
        selectedState.isStartState = true;
        drawCanvas();
    }

    function setAcceptState(){
        selectedState.isAcceptState = true;
        drawCanvas();
    }

    function deleteState(){
        nfa.Q.splice(nfa.Q.indexOf(selectedState),1);
        drawCanvas();
    }

    function formal(automaton){
        let qa = [];
        let fa = [];
        let q0;
        automaton.Q.forEach(state=>{
            qa.push(state.text);
            if(state.isStartState){
                q0 = state.text;
            }
            if(state.isAcceptState){
                fa.push(state.text);
            }     
        });

        let ea = [];
        let éa= [];
        automaton.T.forEach(transition=>{
            ea.push(transition.text);
            éa.push(`𝛿(${transition.from.text},${transition.text})=${transition.to.text}`);
        });

        listFormal(qa,ea,éa,q0,fa,"left");
        listTable(qa,ea,éa,q0,fa,"left");
    }

    function listFormal(q,e,é,q0,f,lor){
        let s_q,s_e,s_é,s_q0,s_f;
        if(lor=="left"){
            s_q = document.querySelector("#left-panel-down #lpd-q");
            s_e = document.querySelector("#left-panel-down #lpd-e");
            s_é = document.querySelector("#left-panel-down #lpd-é");
            s_q0 = document.querySelector("#left-panel-down #lpd-q0");
            s_f = document.querySelector("#left-panel-down #lpd-f");
        }
        else if(lor=="right"){
            s_q = document.querySelector("#right-panel-down #lpd-q");
            s_e = document.querySelector("#right-panel-down #lpd-e");
            s_é = document.querySelector("#right-panel-down #lpd-é");
            s_q0 = document.querySelector("#right-panel-down #lpd-q0");
            s_f = document.querySelector("#right-panel-down #lpd-f");
        }

        s_q.textContent = q.join(",");
        s_e.textContent = e.join(",");
        s_é.textContent = é.join(",");
        s_q0.textContent = q0;
        s_f.textContent = f.join(",");
    }

    function listTable(q,e,é,q0,f,lor){
        let table;
        if(lor=="left"){
            table = document.querySelector("#left-panel-down .table table tbody");
            table.innerHTML="";
            for(let i=-1;i<q.length;i++){
                table.insertAdjacentHTML("beforeend",`
                    <tr>
                    </tr>
                `);
                if(i==-1){
                    table.lastElementChild.insertAdjacentHTML("beforeend",`
                        <th>
                        </th>
                    `);
                    for(let j of e){
                        table.lastElementChild.insertAdjacentHTML("beforeend",`
                            <th>
                                ${j}
                            </th>
                        `);
                    }
                }
                else{
                    table.lastElementChild.insertAdjacentHTML("beforeend",`
                            <td>
                               ${q0==q[i]?"\u2192":f.includes(q[i])?"*":""}${q[i]}
                            </td>
                    `);
                    for(let j of e){
                        let temp;
                        for(let k of nfa.T){
                            if(q[i]==k.from.text && j==k.text){
                                table.lastElementChild.insertAdjacentHTML("beforeend",`
                                    <td>
                                        ${k.to.text}
                                    </td>
                                `);
                                temp=true;
                            }
                        }
                        if(!temp){
                            table.lastElementChild.insertAdjacentHTML("beforeend",`
                                <td>
                                </td>
                            `);
                        }
                    }
                }
            }
        }
    }
})();   
