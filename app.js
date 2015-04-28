ZGN(function()
{
  // Terminalの普通のインスタンス取得
  var term = ZGN.term('1');

  // TerminalのSPIインスタンスを取得
  var spi = term.spi;

  //GPIOセッティング
  var gpio = term.gpio;
  gpio.pinMode('21', ZGN.OUTPUT);
  gpio.digitalWrite('21', ZGN.LOW, function(){});

  // ADT7310の場合
  var txinit = [ 0x54 ];
  var rxinit = [ 0x00 ];
  var txbuf = [ 0x00, 0x00 ];
  var rxbuf = [ 0x00, 0x00 ];

  // 沸騰完了の閾値など
  var th = 30.0;

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
		$('#status').text(temp);	

		if(temp >= th){
    		// 通知処理
			$('#status').text("finished!");
			gpio.digitalWrite('21', ZGN.HIGH, function(){});
			sleep(3000, function(){});
			gpio.digitalWrite('21', ZGN.LOW, function(){});
		}

		//else{
			// 温度を表示
    		//$('#status').text(temp);	
		//}
  	});
  }, 500);
});
