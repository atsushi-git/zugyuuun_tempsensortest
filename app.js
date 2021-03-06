ZGN(function()
{
  // Terminalの普通のインスタンス取得
  var term = ZGN.term('1');
  var term_pb = ZGN.term('2');

  // TerminalのSPIインスタンスを取得
  var spi = term.spi;

  //ケトル側のラズパイ(term)のGPIOセッティング
  var gpio = term.gpio;
  gpio.pinMode('21', ZGN.OUTPUT);
  gpio.digitalWrite('21', ZGN.LOW, function(){});

  //通知側のラズパイ(term_pb)のGPIOセッティング
  var gpio4 = '23';
  var gpio5 = '24';
  var gpio6 = '25';

  var gpio2 = term_pb.gpio;

  gpio2.pinMode(gpio4, ZGN.OUTPUT);
  gpio2.digitalWrite(gpio4, ZGN.HIGH, function(){});
  gpio2.pinMode(gpio5, ZGN.OUTPUT);
  gpio2.digitalWrite(gpio5, ZGN.LOW, function(){});
  gpio2.pinMode(gpio6, ZGN.INPUT);

  var flag_temp=0;
  var temp_status=0;
  var temp_next=0;

  var flag_pb=0;
  var pb_status=0;
  var pb_next=0;

//==========================================================
//ケトル側のラズパイ(term)の処理
//==========================================================

  // ADT7310の場合
  var txinit = [ 0x54 ];
  var rxinit = [ 0x00 ];
  var txbuf = [ 0x00, 0x00 ];
  var rxbuf = [ 0x00, 0x00 ];

  // 沸騰完了の閾値など
  // 初期表面温度29℃, 水量600mlのとき
  var th = 44.0;
  //var th = 30.0;

  // delay
  function sleep(time, callback){
	  setTimeout(callback, time);
  }
 
 /* 
  //センサの精度を16bitに変更
  spi.transfer([0x08, 0x80], [0x00, 0x00], function(tmp) {
  });
*/

  //この待ち時間が大事(FIXME: こう書くとうまく動作する)
  sleep(500, function(){});
  
  //センサの初期設定(13bit, continuous mode)
  spi.transfer(txinit, rxinit, function(tmp){});
  sleep(500, function(){});

  //メインのループ関数
  setInterval(function() {
    // 300ms毎にSPI通信
    spi.transfer(txbuf, rxbuf, function(buf) {
  		var temp = 0;
		//bufを摂氏温度に変換
		temp = ( buf[0] << 8 | buf[1] ) >> 3;
		temp /= 16;
		//温度を表示(デバッグ)
		if(temp != 0){
			$('#status').text(temp+"℃");
		}

		//1. 温度が閾値超えたらフラグを立てる処理
		if(temp >= th){
			//gpio.digitalWrite('21', ZGN.HIGH, function(){});
			if(temp_status==0){
				flag_temp=1;
				temp_status=1;
			}
		}
		else{
			if( (temp < (th-3)) && (temp != 0) ){
				temp_status = 0;
			}
		}

  	});
  }, 500);


//==========================================================
//通知側のラズパイ(term_pb)の処理
//==========================================================

  //flag_pb
  //スイッチが押されるとパトランプとブザーがなる
  //100msごとにスイッチを確認 
  setInterval(function(){
	
  	//フラグがたったらパトランプつける
  	gpio2.digitalRead(gpio6, function(pin6Status){
  		//1. フラグを立てる処理
		//スイッチ押されたとき
		if( pin6Status == ZGN.HIGH ){
			//通知処理待ち
			if( pb_status == 0 )		flag_pb=1;
			//停止処理待ち
			else if( pb_status == 1 )	flag_pb=2;
		}
		//スイッチ押されてないとき
		else{
			pb_status = pb_next;
			flag_pb=0;
		}
	
		//2. フラグを見てgpioを操作する処理	
		//通知処理(お湯が沸いたよ！)
		if( (flag_pb == 1) || (flag_temp == 1) ){
			gpio2.digitalWrite(gpio4, ZGN.LOW, function(){});
			gpio2.digitalWrite(gpio5, ZGN.HIGH, function(){});
			flag_temp = 0;
			pb_next=1;
		}
		//停止処理(ユーザにスイッチが押されたから止めるよ！)
		else if( flag_pb == 2 ){
			gpio2.digitalWrite(gpio4, ZGN.HIGH, function(){});
			gpio2.digitalWrite(gpio5, ZGN.LOW, function(){});
			pb_next=0;
		}
	});
  }, 100);


});



