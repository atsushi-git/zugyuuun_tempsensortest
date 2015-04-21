ZGN(function()
{
  // TerminalのSPIインスタンスを取得
  var spi = ZGN.term('1').spi;

  // 送信バッファに[ 0x06, 0x00, 0x00 ]を指定
  // ※MCP3208のCH0をシングルエンドで動かす場合
  var txbuf = [ 0x06, 0x00, 0x00 ];
  var rxbuf = [ 0x00, 0x00, 0x00 ];

  setInterval(function() {
    // 100ms毎にSPI通信でCH0の状態を取得
    spi.transfer(txbuf, rxbuf, function(buf) {
      var s = 0;

      // 結果配列（16進数の配列）から整数値を取得
      for (var i=0; i < buf.length; i++)
          s += buf[i] << (2-i)*8;

      // 結果を表示
      $('#status').text(s);
    });
  }, 100);
});
