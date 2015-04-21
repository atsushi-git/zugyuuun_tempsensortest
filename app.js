ZGN(function()
{
  // TerminalのSPIインスタンスを取得
  var spi = ZGN.term('1').spi;

  // ADT7310の場合
  var txinit = [ 0x54 ];
  var rxinit = [ 0x00 ];
  var txbuf = [ 0x00, 0x00 ];
  var rxbuf = [ 0x00, 0x00 ];

  //delay
  function sleep(time, callback){
	  setTimeout(callback, time);
  }
  
  //センサの精度を16bitに変更
  spi.transfer([0x08, 0x80], [0x00, 0x00], function(tmp) {
  });

  sleep(500, function(){});

  //センサ計測開始
  spi.transfer(txinit, rxinit, function(tmp) {
  });

  sleep(500, function(){});

  //メインのループ関数
  setInterval(function() {
    // 500ms毎にSPI通信でCH0の状態を取得
    spi.transfer(txbuf, rxbuf, function(buf) {
    	var temp = 0x0000;
		var itemp = 0;

		// 結果配列（16進数の配列）から整数値を取得
		temp = buf[0] << 8;
		temp |= buf[1];
		//temp = temp >> 3;
		itemp = temp / 16;

    	// 結果を表示
    	$('#status').text(itemp);
  	});
  }, 500);
});
