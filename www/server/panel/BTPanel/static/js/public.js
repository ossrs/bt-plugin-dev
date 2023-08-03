$(function () {
  $.fn.extend({
    fixedThead: function (options) {
      var _that = $(this);
      var option = {
        height: 400,
        shadow: true,
        resize: true
      };
      options = $.extend(option, options);
      if ($(this).find('table').length === 0) {
        return false;
      }
      var _height = $(this)[0].style.height, _table_config = _height.match(/([0-9]+)([%\w]+)/);
      if (_table_config === null) {
        _table_config = [null, options.height, 'px'];
      } else {
        $(this).css({
          'boxSizing': 'content-box',
          'paddingBottom': $(this).find('thead').height()
        });
      }
      $(this).css({ 'position': 'relative' });
      var _thead = $(this).find('thead')[0].outerHTML,
          _tbody = $(this).find('tbody')[0].outerHTML,
          _thead_div = $('<div class="thead_div"><table class="table table-hover mb0"></table></div>'),
          _shadow_top = $('<div class="tbody_shadow_top"></div>'),
          _tbody_div = $('<div class="tbody_div" style="height:' + _table_config[1] + _table_config[2] + ';"><table class="table table-hover mb0" style="margin-top:-' + $(this).find('thead').height() + 'px"></table></div>'),
          _shadow_bottom = $('<div class="tbody_shadow_bottom"></div>');
      _thead_div.find('table').append(_thead);
      _tbody_div.find('table').append(_thead);
      _tbody_div.find('table').append(_tbody);
      $(this).html('');
      $(this).append(_thead_div);
      $(this).append(_shadow_top);
      $(this).append(_tbody_div);
      $(this).append(_shadow_bottom);
      var _table_width = _that.find('.thead_div table')[0].offsetWidth,
          _body_width = _that.find('.tbody_div table')[0].offsetWidth,
          _length = _that.find('tbody tr:eq(0)>td').length;
      $(this).find('tbody tr:eq(0)>td').each(function (index, item) {
        var _item = _that.find('thead tr:eq(0)>th').eq(index);
        if (index === (_length - 1)) {
          _item.attr('width', $(item)[0].clientWidth + (_table_width - _body_width));
        } else {
          _item.attr('width', $(item)[0].offsetWidth);
        }
      });
      if (options.resize) {
        $(window).resize(function () {
          var _table_width = _that.find('.thead_div table')[0].offsetWidth,
              _body_width = _that.find('.tbody_div table')[0].offsetWidth,
              _length = _that.find('tbody tr:eq(0)>td').length;
          _that.find('tbody tr:eq(0)>td').each(function (index, item) {
            var _item = _that.find('thead tr:eq(0)>th').eq(index);
            if (index === (_length - 1)) {
              _item.attr('width', $(item)[0].clientWidth + (_table_width - _body_width));
            } else {
              _item.attr('width', $(item)[0].offsetWidth);
            }
          });
        });
      }
      if (options.shadow) {
        var table_body = $(this).find('.tbody_div')[0];
        if (_table_config[1] >= table_body.scrollHeight) {
          $(this).find('.tbody_shadow_top').hide();
          $(this).find('.tbody_shadow_bottom').hide();
        } else {
          $(this).find('.tbody_shadow_top').hide();
          $(this).find('.tbody_shadow_bottom').show();
        }
        $(this).find('.tbody_div').scroll(function (e) {
          var _scrollTop = $(this)[0].scrollTop,
              _scrollHeight = $(this)[0].scrollHeight,
              _clientHeight = $(this)[0].clientHeight,
              _shadow_top = _that.find('.tbody_shadow_top'),
              _shadow_bottom = _that.find('.tbody_shadow_bottom');
          if (_scrollTop == 0) {
            _shadow_top.hide();
            _shadow_bottom.show();
          } else if (_scrollTop > 0 && _scrollTop < (_scrollHeight - _clientHeight)) {
            _shadow_top.show();
            _shadow_bottom.show();
          } else if (_scrollTop == (_scrollHeight - _clientHeight)) {
            _shadow_top.show();
            _shadow_bottom.hide();
          }
        })
      }
    }

  });

}(jQuery))

$(document).ready(function () {
  $(".sub-menu a.sub-menu-a").click(function () {
    $(this).next(".sub").slideToggle("slow").siblings(".sub:visible").slideUp("slow");
  });
});
var aceEditor = {
  layer_view: '',
  aceConfig: {},  //ace配置参数
  editor: null,
  pathAarry: [],
  editorLength: 0,
  isAceView: true,
  ace_active: '',
  is_resizing: false,
  menu_path: '', //当前文件目录根地址
  refresh_config: {
    el: {}, // 需要重新获取的元素,为DOM对象
    path: '',// 需要获取的路径文件信息
    group: 1,// 当前列表层级，用来css固定结构
    is_empty: true
  }, //刷新配置参数
  editorStatus: 0,  //编辑器状态 默认还原 0还原 1最大化 -1最小化
  // 事件编辑器-方法，事件绑定
  eventEditor: function () {
    var _this = this, _icon = '<span class="icon"><i class="glyphicon glyphicon-ok" aria-hidden="true"></i></span>';
    $(window).resize(function () {
      if (_this.ace_active !== undefined) _this.setEditorView()
      if (aceEditor.editorStatus === 0 || aceEditor.editorStatus === 1) {
        var winW = $(this)[0].innerWidth,
            winH = $(this)[0].innerHeight
        $('.aceEditors').css({
          'top': aceEditor.editorStatus ? 0 : winH/8,
          'left': aceEditor.editorStatus ? 0 : winW/8,
          'width': aceEditor.editorStatus ? winW : winW/4*3,
          'height': aceEditor.editorStatus ? winH : winH/4*3
        });
        $('.aceEditors .layui-layer-content').css({'height' : $('.aceEditors').height() - 42})
      }
    })
    $(document).click(function (e) {
      $('.ace_toolbar_menu').hide();
      $('.ace_conter_editor .ace_editors').css('fontSize', _this.aceConfig.aceEditor.fontSize + 'px');
      $('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
    });
    $('.ace_editor_main').on('click', function () {
      $('.ace_toolbar_menu').hide();
    });
    $('.ace_toolbar_menu').click(function (e) {
      e.stopPropagation();
      e.preventDefault();
    });
    // 显示工具条
    $('.ace_header .pull-down').click(function () {
      if ($(this).find('i').hasClass('glyphicon-menu-down')) {
        $('.ace_header').css({ 'top': '-30px' });
        $('.ace_overall').css({ 'top': '0' });
        $(this).css({ 'top': '30px', 'height': '30px', 'line-height': '30px' });
        $(this).find('i').addClass('glyphicon-menu-up').removeClass('glyphicon-menu-down');
      } else {
        $('.ace_header').css({ 'top': '0' });
        $('.ace_overall').css({ 'top': '30px' });
        $(this).removeAttr('style');
        $(this).find('i').addClass('glyphicon-menu-down').removeClass('glyphicon-menu-up');
      }
      _this.setEditorView();
    });
    // 切换TAB视图
    $('.ace_conter_menu').on('click', '.item', function (e) {
      var _id = $(this).attr('data-id'), _item = _this.editor[_id]
      $('.item_tab_' + _id).addClass('active').siblings().removeClass('active');
      $('#ace_editor_' + _id).addClass('active').siblings().removeClass('active');
      _this.ace_active = _id;
      _this.currentStatusBar(_id);
      _this.is_file_history(_item);
    });
    // 移上TAB按钮变化，仅文件被修改后
    $('.ace_conter_menu').on('mouseover', '.item .icon-tool', function () {
      var type = $(this).attr('data-file-state');
      if (type != '0') {
        $(this).removeClass('glyphicon-exclamation-sign').addClass('glyphicon-remove');
      }
    });
    // 移出tab按钮变化，仅文件被修改后
    $('.ace_conter_menu').on('mouseout', '.item .icon-tool', function () {
      var type = $(this).attr('data-file-state');
      if (type != '0') {
        $(this).removeClass('glyphicon-remove').addClass('glyphicon-exclamation-sign');
      }
    });
    // 关闭编辑视图
    $('.ace_conter_menu').on('click', '.item .icon-tool', function (e) {
      var file_type = $(this).attr('data-file-state');
      var file_title = $(this).attr('data-title');
      var _id = $(this).parent().parent().attr('data-id');
      switch (file_type) {
          // 直接关闭
        case '0':
          _this.removeEditor(_id);
          break;
          // 未保存
        case '1':
          var loadT = layer.open({
            type: 1,
            area: ['400px', '180px'],
            title: '提示',
            content: '<div class="ace-clear-form">\
							<div class="clear-icon"></div>\
							<div class="clear-title">是否保存对&nbsp<span class="size_ellipsis" style="max-width:150px;vertical-align: top;" title="' + file_title + '">' + file_title + '</span>&nbsp的更改？</div>\
							<div class="clear-tips">如果不保存，更改会丢失！</div>\
							<div class="ace-clear-btn" style="">\
								<button type="button" class="btn btn-sm btn-default" style="float:left" data-type="2">不保存文件</button>\
								<button type="button" class="btn btn-sm btn-default" style="margin-right:10px;" data-type="1">取消</button>\
								<button type="button" class="btn btn-sm btn-success" data-type="0">保存文件</button>\
							</div>\
						</div>',
            success: function (layers, index) {
              $('.ace-clear-btn .btn').click(function () {
                var _type = $(this).attr('data-type'),
                    _item = _this.editor[_id];
                switch (_type) {
                  case '0': //保存文件
                    _this.saveFileMethod(_item);
                    break;
                  case '1': //关闭视图
                    layer.close(index);
                    break;
                  case '2': //取消保存
                    _this.removeEditor(_id);
                    layer.close(index);
                    break;
                }
              });
            }
          });
          break;
      }
      $('.ace_toolbar_menu').hide();
      $('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
      e.stopPropagation();
      e.preventDefault();
    });
    $(window).keyup(function (e) {
      if (e.keyCode === 116 && $('#ace_conter').length == 1) {
        layer.msg('编辑器模式下无法刷新网页，请关闭后重试');
      }
    });
    // 新建编辑器视图
    $('.ace_editor_add').click(function () {
      _this.addEditorView();
    });
    // 底部状态栏功能按钮
    $('.ace_conter_toolbar .pull-right span').click(function (e) {
      var _type = $(this).attr('data-type'),
          _item = _this.editor[_this.ace_active];
      $('.ace_toolbar_menu').show();
      switch (_type) {
        case 'cursor':
          $('.ace_toolbar_menu').hide();
          $('.ace_header .jumpLine').click();
          break;

        case 'history':
          $('.ace_toolbar_menu').hide();
          if (_item.historys.length === 0) {
            layer.msg('历史文件为空', { icon: 0 });
            return false;
          }
          _this.layer_view = layer.open({
            type: 1,
            area: '550px',
            title: '文件历史版本[ ' + _item.fileName + ' ]',
            skin: 'historys_layer',
            content: '<div class="pd20">\
							<div class="divtable" style="overflow:auto;height:450px;">\
								<table class="historys table table-hover">\
									<thead><tr><th>版本时间</th><th style="text-align:right;">操作</th></tr></thead>\
									<tbody></tbody>\
								</table>\
							</div>\
						</div>',
            success: function (layeo, index) {
              var _html = '';
              for (var i = 0; i < _item.historys.length; i++) {
                _html += '<tr><td>' + bt.format_data(_item.historys[i]) + '</td><td align="right"><a href="javascript:;" class="btlink open_history_file" data-time="' + _item.historys[i] + '">打开文件</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="javascript:;" class="btlink recovery_file_historys" data-history="' + _item.historys[i] + '" data-path="' + _item.path + '">恢复</a></td></tr>'
              }
              if (_html === '') _html += '<tr><td colspan="3">当前文件无历史版本</td></tr>'
              $('.historys tbody').html(_html);
              $('.historys_layer').css('top', ($(window).height() / 2) - ($('.historys_layer').height() / 2) + 'px')
              $('.open_history_file').click(function () {
                var _history = $(this).attr('data-time');
                _this.openHistoryEditorView({ filename: _item.path, history: _history }, function () {
                  layer.close(index);
                  $('.ace_conter_tips').show();
                  $('.ace_conter_tips .tips').html('只读文件，文件为' + _item.path + '，历史版本 [ ' + bt.format_data(new Number(_history)) + ' ]<a href="javascript:;" class="ml35 btlink" data-path="' + _item.path + '" data-history="' + _history + '">点击恢复当前历史版本</a>');
                });
              });
              $('.recovery_file_historys').click(function () {
                _this.event_ecovery_file(this);
              });
            }
          });
          break;
        case 'tab':
          $('.ace_toolbar_menu .menu-tabs').show().siblings().hide();
          $('.tabsType').find(_item.softTabs ? '[data-value="nbsp"]' : '[data-value="tabs"]').addClass('active').append(_icon);
          $('.tabsSize [data-value="' + _item.tabSize + '"]').addClass('active').append(_icon);
          break;
        case 'encoding':
          _this.getEncodingList(_item.encoding);
          $('.ace_toolbar_menu .menu-encoding').show().siblings().hide();
          break;
        case 'readOnly':
          $('.ace_toolbar_menu').hide();
          layer.msg('当前文件过大，只可阅读，不可修改', { icon: 6 });
          break;
        case 'lang':
          $('.ace_toolbar_menu').hide();
          layer.msg('暂不支持切换语言模式，敬请期待!', { icon: 6 });
          break;
      }
      e.stopPropagation();
      e.preventDefault();
    });
    // 隐藏目录
    $('.tips_fold_icon .glyphicon').click(function () {
      if ($(this).hasClass('glyphicon-menu-left')) {
        $('.ace_conter_tips').css('right', '0');
        $('.tips_fold_icon').css('left', '0');
        $(this).removeClass('glyphicon-menu-left').addClass('glyphicon-menu-right');
      } else {
        $('.ace_conter_tips').css('right', '-100%');
        $('.tips_fold_icon').css('left', '-25px');
        $(this).removeClass('glyphicon-menu-right').addClass('glyphicon-menu-left');
      }
    });
    // 设置换行符
    $('.menu-tabs').on('click', 'li', function (e) {
      var _val = $(this).attr('data-value'), _item = _this.editor[_this.ace_active];
      if ($(this).parent().hasClass('tabsType')) {
        _item.ace.getSession().setUseSoftTabs(_val == 'nbsp');
        _item.softTabs = _val == 'nbsp';
      } else {
        _item.ace.getSession().setTabSize(_val);
        _item.tabSize = _val;
      }
      $(this).siblings().removeClass('active').find('.icon').remove();
      $(this).addClass('active').append(_icon);
      _this.currentStatusBar(_item.id);
      e.stopPropagation();
      e.preventDefault();
    });
    // 设置编码内容
    $('.menu-encoding').on('click', 'li', function (e) {
      var _item = _this.editor[_this.ace_active];
      layer.msg('设置文件编码：' + $(this).attr('data-value'));
      $('.ace_conter_toolbar [data-type="encoding"]').html('编码：<i>' + $(this).attr('data-value') + '</i>');
      $(this).addClass('active').append(_icon).siblings().removeClass('active').find('span').remove();
      _item.encoding = $(this).attr('data-value');
      _this.saveFileMethod(_item);
    });
    // 搜索内容键盘事件
    $('.menu-files .menu-input').keyup(function () {
      _this.searchRelevance($(this).val());
      if ($(this).val != '') {
        $(this).next().show();
      } else {
        $(this).next().hide();
      }
    });
    // 清除搜索内容事件
    $('.menu-files .menu-conter .fa').click(function () {
      $('.menu-files .menu-input').val('').next().hide();
      _this.searchRelevance();
    });
    // 顶部状态栏
    $('.ace_header>span').click(function (e) {
      var type = $(this).attr('class'), _item = _this.editor[_this.ace_active];
      if (_this.ace_active == '' && type != 'helps') {
        return false;
      }
      switch (type) {
        case 'saveFile': //保存当时文件
          _this.saveFileMethod(_item);
          break;
        case 'saveFileAll': //保存全部
          var loadT = layer.open({
            type: 1,
            area: ['350px', '180px'],
            title: '提示',
            content: '<div class="ace-clear-form">\
							<div class="clear-icon"></div>\
							<div class="clear-title">是否保存对全部文件的更改？</div>\
							<div class="clear-tips">如果不保存，更改会丢失！</div>\
							<div class="ace-clear-btn" style="">\
								<button type="button" class="btn btn-sm btn-default clear-btn" style="margin-right:10px;" >取消</button>\
								<button type="button" class="btn btn-sm btn-success save-all-btn">保存文件</button>\
							</div>\
						</div>',
            success: function (layers, index) {
              $('.clear-btn').click(function () {
                layer.close(index);
              });
              $('.save-all-btn').click(function () {
                var _arry = [], editor = aceEditor['editor'];
                for (var item in editor) {
                  _arry.push({
                    path: editor[item]['path'],
                    data: editor[item]['ace'].getValue(),
                    encoding: editor[item]['encoding'],
                    id:editor[item].id,
                    st_mtime:editor[item].st_mtime
                  })
                }
                _this.saveAllFileBody(_arry, function () {
                  $('.ace_conter_menu>.item').each(function (el, index) {
                    var _id = $(this).attr('data-id');
                    $(this).find('i').attr('data-file-state', '0').removeClass('glyphicon-exclamation-sign').addClass('glyphicon-remove');
                    aceEditor['editor'][_id].fileType = 0;
                  });
                  layer.close(index);
                });
              });
            }
          });
          break;
        case 'refreshs': //刷新文件
          if (_item.fileType === 0) {
            aceEditor.getFileBody({ path: _item.path }, function (res) {
              _item.ace.setValue(res.data);
              _item.fileType = 0;
              $('.item_tab_' + _item.id + ' .icon-tool').attr('data-file-state', '0').removeClass('glyphicon-exclamation-sign').addClass('glyphicon-remove');
              layer.msg('刷新成功', { icon: 1 });
            });
            return false;
          }
          var loadT = layer.open({
            type: 1,
            area: ['350px', '180px'],
            title: '提示',
            content: '<div class="ace-clear-form">\
							<div class="clear-icon"></div>\
							<div class="clear-title">是否刷新当前文件</div>\
							<div class="clear-tips">刷新当前文件会覆盖当前修改,是否继续！</div>\
							<div class="ace-clear-btn" style="">\
								<button type="button" class="btn btn-sm btn-default clear-btn" style="margin-right:10px;" >取消</button>\
								<button type="button" class="btn btn-sm btn-success save-all-btn">确定</button>\
							</div>\
						</div>',
            success: function (layers, index) {
              $('.clear-btn').click(function () {
                layer.close(index);
              });
              $('.save-all-btn').click(function () {
                aceEditor.getFileBody({ path: _item.path }, function (res) {
                  layer.close(index);
                  _item.ace.setValue(res.data);
                  _item.fileType == 0;
                  $('.item_tab_' + _item.id + ' .icon-tool').attr('data-file-state', '0').removeClass('glyphicon-exclamation-sign').addClass('glyphicon-remove');
                  layer.msg('刷新成功', { icon: 1 });
                });
              });
            }
          });
          break;
          // 搜索
        case 'searchs':
          _item.ace.execCommand('find');
          break;
          // 替换
        case 'replaces':
          _item.ace.execCommand('replace');
          break;
          // 跳转行
        case 'jumpLine':
          $('.ace_toolbar_menu').show().find('.menu-jumpLine').show().siblings().hide();
          $('.set_jump_line input').val('').focus();
          var _cursor = aceEditor.editor[aceEditor.ace_active].ace.selection.getCursor();
          $('.set_jump_line .jump_tips span:eq(0)').text(_cursor.row);
          $('.set_jump_line .jump_tips span:eq(1)').text(_cursor.column);
          $('.set_jump_line .jump_tips span:eq(2)').text(aceEditor.editor[aceEditor.ace_active].ace.session.getLength());
          $('.set_jump_line input').unbind('keyup').on('keyup', function (e) {
            var _val = $(this).val();
            if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
              if (_val != '' && typeof parseInt(_val) == 'number') {
                _item.ace.gotoLine(_val);
              };
            }
          });
          break;
          // 字体
        case 'fontSize':
          $('.ace_toolbar_menu').show().find('.menu-fontSize').show().siblings().hide();
          $('.menu-fontSize .set_font_size input').val(_this.aceConfig.aceEditor.fontSize).focus();
          $('.menu-fontSize set_font_size input').unbind('keypress onkeydown').on('keypress onkeydown', function (e) {
            var _val = $(this).val();
            if (_val == '') {
              $(this).css('border', '1px solid red');
              $(this).next('.tips').text('字体设置范围 12-45');
            } else if (!isNaN(_val)) {
              $(this).removeAttr('style');
              if (parseInt(_val) > 11 && parseInt(_val) < 45) {
                $('.ace_conter_editor .ace_editors').css('fontSize', _val + 'px')
              } else {
                $('.ace_conter_editor .ace_editors').css('fontSize', '13px');
                $(this).css('border', '1px solid red');
                $(this).next('.tips').text('字体设置范围 12-45');
              }
            } else {
              $(this).css('border', '1px solid red');
              $(this).next('.tips').text('字体设置范围 12-45');
            }
            e.stopPropagation();
            e.preventDefault();
          });
          $('.menu-fontSize .menu-conter .set_font_size input').unbind('change').change(function () {
            var _val = $(this).val();
            $('.ace_conter_editor .ace_editors').css('fontSize', _val + 'px');
          });
          $('.set_font_size .btn-save').unbind('click').click(function () {
            var _fontSize = $('.set_font_size input').val();
            _this.aceConfig.aceEditor.fontSize = parseInt(_fontSize);
            _this.saveAceConfig(_this.aceConfig, function (res) {
              if (res.status) {
                $('.ace_editors').css('fontSize', _fontSize + 'px');
                layer.msg('设置成功', { icon: 1 });
              }
            });
          });
          break;
          //主题
        case 'themes':
          $('.ace_toolbar_menu').show().find('.menu-themes').show().siblings().hide();
          var _html = '', _arry = ['白色主题', '黑色主题'];
          for (var i = 0; i < _this.aceConfig.themeList.length; i++) {
            if (_this.aceConfig.themeList[i] != _this.aceConfig.aceEditor.editorTheme) {
              _html += '<li data-value="' + _this.aceConfig.themeList[i] + '">' + _this.aceConfig.themeList[i] + '【' + _arry[i] + '】</li>';
            } else {
              _html += '<li data-value="' + _this.aceConfig.themeList[i] + '" class="active">' + _this.aceConfig.themeList[i] + '【' + _arry[i] + '】' + _icon + '</li>';
            }
          }
          $('.menu-themes ul').html(_html);
          $('.menu-themes ul li').click(function () {
            var _theme = $(this).attr('data-value');
            $(this).addClass('active').append(_icon).siblings().removeClass('active').find('.icon').remove();
            _this.aceConfig.aceEditor.editorTheme = _theme;
            _this.saveAceConfig(_this.aceConfig, function (res) {
              for (var item in _this.editor) {
                _this.editor[item].ace.setTheme("ace/theme/" + _theme);
              }
              layer.msg('设置成功', { icon: 1 });
            });
          });
          break;
        case 'setUp':
          $('.ace_toolbar_menu').show().find('.menu-setUp').show().siblings().hide();
          $('.menu-setUp .editor_menu li').each(function (index, el) {
            var _type = _this.aceConfig.aceEditor[$(el).attr('data-type')];
            if (_type) $(el).addClass('active').append(_icon);
          })
          $('.menu-setUp .editor_menu li').unbind('click').click(function () {
            var _type = $(this).attr('data-type');
            _this.aceConfig.aceEditor[_type] = !$(this).hasClass('active');
            if ($(this).hasClass('active')) {
              $(this).removeClass('active').find('.icon').remove();
            } else {
              $(this).addClass('active').append(_icon);
            }
            _this.saveAceConfig(_this.aceConfig, function (res) {
              for (var item in _this.editor) {
                _this.editor[item].ace.setOption(_type, _this.aceConfig.aceEditor[_type]);
              }
              layer.msg('设置成功', { icon: 1 });
            });
          });
          break;
        case 'helps':
          if (!$('[data-type=shortcutKeys]').length != 0) {
            _this.addEditorView(1, { title: '快捷键提示', html: aceShortcutKeys.innerHTML });
          } else {
            $('[data-type=shortcutKeys]').click();
          }
          break;
      }

      e.stopPropagation();
      e.preventDefault();
    });

    // 文件目录选择
    $('.ace_catalogue_list').on('click', '.has-children .file_fold', function (e) {
      var _layers = $(this).attr('data-layer'), _type = $(this).find('data-type'), _path = $(this).parent().attr('data-menu-path'), _menu = $(this).find('.glyphicon'), _group = parseInt($(this).attr('data-group')), _file = $(this).attr('data-file'), _tath = $(this);
      var _active = $('.ace_catalogue_list .has-children .file_fold.edit_file_group');
      if (_active.length > 0 && $(this).attr('data-edit') === undefined) {
        switch (_active.attr('data-edit')) {
          case '2':
            _active.find('.file_input').siblings().show();
            _active.find('.file_input').remove();
            _active.removeClass('edit_file_group').removeAttr('data-edit');
            break;
          case '1':
          case '0':
            _active.parent().remove();
            break;
        }
        layer.closeAll('tips');
      }
      $('.ace_toolbar_menu').hide();
      $('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
      if ($(this).hasClass('edit_file_group')) return false;
      $('.ace_catalogue_list .has-children .file_fold').removeClass('bg');
      $(this).addClass('bg');
      if ($(this).data('file') === 'Dir') {
        if (_menu.hasClass('glyphicon-menu-right')) {
          _menu.removeClass('glyphicon-menu-right').addClass('glyphicon-menu-down');
          $(this).next().show();
          if ($(this).next().find('li').length === 0) _this.reader_file_dir_menu({ el: $(this).next(), path: _path, group: _group + 1 });
        } else {
          _menu.removeClass('glyphicon-menu-down').addClass('glyphicon-menu-right');
          $(this).next().hide();
        }
      } else {
        _this.openEditorView(_path, function (res) {
          if (res.status) _tath.addClass('active');
        });
      }
      e.stopPropagation();
      e.preventDefault();
    });

    // 禁用目录选择（文件目录）
    $('.ace_catalogue').bind("selectstart", function (e) {
      var omitformtags = ["input", "textarea"];
      omitformtags = "|" + omitformtags.join("|") + "|";
      if (omitformtags.indexOf("|" + e.target.tagName.toLowerCase() + "|") == -1) {
        return false;
      } else {
        return true;
      }
    });
    // 返回目录（文件目录主菜单）
    $('.ace_dir_tools').on('click', '.upper_level', function () {
      var _paths = $(this).attr('data-menu-path');
      _this.reader_file_dir_menu({ path: _paths, is_empty: true });
      $('.ace_catalogue_title').html('目录：' + _paths).attr('title', _paths);
    });
    // 新建文件（文件目录主菜单）
    $('.ace_dir_tools').on('click', '.new_folder', function (e) {
      var _paths = $(this).parent().find('.upper_level').attr('data-menu-path');
      $(this).find('.folder_down_up').show();
      $(document).click(function () {
        $('.folder_down_up').hide();
        $(this).unbind('click');
        return false;
      });
      $('.ace_toolbar_menu').hide();
      $('.ace_catalogue_menu').hide();
      $('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
      e.stopPropagation();
      e.preventDefault();
    });
    // 刷新列表 (文件目录主菜单)
    $('.ace_dir_tools').on('click', '.refresh_dir', function (e) {
      _this.refresh_config = {
        el: $('.cd-accordion-menu')[0],
        path: $('.ace_catalogue_title').attr('title'),
        group: 1,
        is_empty: true
      }
      _this.reader_file_dir_menu(_this.refresh_config, function () {
        layer.msg('刷新成功', { icon: 1 });
      });
    });
    // 搜索内容 (文件目录主菜单)
    $('.ace_dir_tools').on('click', '.search_file', function (e) {
      if ($(this).parent().find('.search_input_view').length == 0) {
        $(this).siblings('div').hide();
        $(this).css('color', '#ec4545').attr({ 'title': '关闭' }).find('.glyphicon').removeClass('glyphicon-search').addClass('glyphicon-remove').next().text("关闭");
        $(this).before('<div class="search_input_title">搜索目录文件</div>');
        $(this).after('<div class="search_input_view">\
					<form>\
                        <input type="text" id="search_input_val" class="ser-text pull-left" placeholder="">\
                        <button type="button" class="ser-sub pull-left"></button>\
                    </form>\
                    <div class="search_boxs">\
                        <input id="search_alls" type="checkbox">\
                        <label for="search_alls"><span>包含子目录文件</span></label>\
                    </div>\
                </div>');
        $('.ace_catalogue_list').css('top', '150px');
        $('.ace_dir_tools').css('height', '110px');
        $('.cd-accordion-menu').empty();
      } else {
        $(this).siblings('div').show();
        $(this).parent().find('.search_input_view,.search_input_title').remove();
        $(this).removeAttr('style').attr({ 'title': '搜索内容' }).find('.glyphicon').removeClass('glyphicon-remove').addClass('glyphicon-search').next().text("搜索");
        $('.ace_catalogue_list').removeAttr('style');
        $('.ace_dir_tools').removeAttr('style');
        _this.refresh_config = {
          el: $('.cd-accordion-menu')[0],
          path: $('.ace_catalogue_title').attr('title'),
          group: 1,
          is_empty: true
        }
        _this.reader_file_dir_menu(_this.refresh_config);
      }
    });

    // 搜索文件内容
    $('.ace_dir_tools').on('click', '.search_input_view button', function (e) {
      var path = _this.menu_path,
          search = $('#search_input_val').val();
      _this.reader_file_dir_menu({
        el: $('.cd-accordion-menu')[0],
        path: path,
        group: 1,
        search: search,
        all: $('#search_alls').is(':checked') ? 'True' : 'False',
        is_empty: true
      })
    });

    // 当前根目录操作，新建文件或目录
    $('.ace_dir_tools').on('click', '.folder_down_up li', function (e) {
      var _type = parseInt($(this).attr('data-type')), element = $('.cd-accordion-menu'), group = 0, type = 'Dir';
      if ($('.file_fold.bg').length > 0 && $('.file_fold.bg').data('file') !== 'files') {
        element = $('.file_fold.bg');
        group = parseInt(element.data('group'));
        type = element.data('file');
        if (type === 'Files' && group !== 0) {
          if (group === 1) {
            element = element.parent().parent()
          } else {
            element = element.parent().parent().prev()
          }
          group = group - 1;
        }
      }
      // console.log(element)
      switch (_type) {
        case 2:
          _this.newly_file_type_dom(element, group, 0);
          break;
        case 3:
          _this.newly_file_type_dom(element, group, 1);
          break;
      }
      _this.refresh_config = {
        el: $('.cd-accordion-menu')[0],
        path: $('.ace_catalogue_title').attr('title'),
        group: 1,
        is_empty: true
      }
      $(this).parent().hide();
      $('.ace_toolbar_menu').hide();
      $('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
      e.preventDefault();
      e.stopPropagation();
    });
    // 移动编辑器文件目录
    $('.ace_catalogue_drag_icon .drag_icon_conter').on('mousedown', function (e) {
      var _left = $('.aceEditors')[0].offsetLeft;
      $('.ace_gutter-layer').css('cursor', 'col-resize');
      $('#ace_conter').unbind().on('mousemove', function (ev) {
        var _width = (ev.clientX + 1) - _left;
        if (_width >= 265 && _width <= 450) {
          $('.ace_catalogue').css({ 'width': _width, 'transition': 'none' });
          $('.ace_editor_main').css({ 'marginLeft': _width, 'transition': 'none' });
          $('.ace_catalogue_drag_icon ').css('left', _width);
          $('.file_fold .newly_file_input').width($('.file_fold .newly_file_input').parent().parent().parent().width() - ($('.file_fold .newly_file_input').parent().parent().attr('data-group') * 15 - 5) - 20 - 30 - 53);
        }
      }).on('mouseup', function (ev) {
        $('.ace_gutter-layer').css('cursor', 'inherit');
        $('.ace_catalogue').css('transition', 'all 500ms');
        $('.ace_editor_main').css('transition', 'all 500ms');
        $(this).unbind('mouseup mousemove');
      });
    });
    // 收藏目录显示和隐藏
    $('.ace_catalogue_drag_icon .fold_icon_conter').on('click', function (e) {
      if ($('.ace_overall').hasClass('active')) {
        $('.ace_overall').removeClass('active');
        $('.ace_catalogue').css('left', '0');
        $(this).removeClass('active').attr('title', '隐藏文件目录');
        $('.ace_editor_main').css('marginLeft', $('.ace_catalogue').width());
      } else {
        $('.ace_overall').addClass('active');
        $('.ace_catalogue').css('left', '-' + $('.ace_catalogue').width() + 'px');
        $(this).addClass('active').attr('title', '显示文件目录');
        $('.ace_editor_main').css('marginLeft', 0);
      }
      setTimeout(function () {
        if (_this.ace_active != '') _this.editor[_this.ace_active].ace.resize();
      }, 600);
    });
    // 恢复历史文件
    $('.ace_conter_tips').on('click', 'a', function () {
      _this.event_ecovery_file(this);
    });
    // 右键菜单
    $('.ace_catalogue_list').on('mousedown', '.has-children .file_fold', function (e) {
      var x = e.clientX, y = e.clientY, _left = $('.aceEditors')[0].offsetLeft, _top = $('.aceEditors')[0].offsetTop, _that = $('.ace_catalogue_list .has-children .file_fold'), _active = $('.ace_catalogue_list .has-children .file_fold.edit_file_group');
      $('.ace_toolbar_menu').hide();
      if (e.which === 3) {
        if ($(this).hasClass('edit_file_group')) return false;
        $('.ace_catalogue_menu').css({ 'display': 'block', 'left': x + 15, 'top': y + 10 });
        _that.removeClass('bg');
        $(this).addClass('bg');
        _active.attr('data-edit') != '2' ? _active.parent().remove() : '';
        _that.removeClass('edit_file_group').removeAttr('data-edit');
        _that.find('.file_input').siblings().show();
        _that.find('.file_input').remove();
        $('.ace_catalogue_menu li').show();
        if ($(this).attr('data-file') == 'Dir') {
          $('.ace_catalogue_menu li:nth-child(6)').hide();
        } else {
          $('.ace_catalogue_menu li:nth-child(-n+4)').hide();
        }
        $(document).click(function () {
          $('.ace_catalogue_menu').hide();
          $(this).unbind('click');
          return false;
        });
        _this.refresh_config = {
          el: $(this).parent().parent()[0],
          path: _this.get_file_dir($(this).parent().attr('data-menu-path'), 1),
          group: parseInt($(this).attr('data-group')),
          is_empty: true
        }
      }
    });
    // 文件目录右键功能
    $('.ace_catalogue_menu li').click(function (e) {
      _this.newly_file_type(this);
    });
    // 新建、重命名鼠标事件
    $('.ace_catalogue_list').on('click', '.has-children .edit_file_group .glyphicon-ok', function () {
      var _file_or_dir = $(this).parent().find('input').val(),
          _file_type = $(this).parent().parent().attr('data-file'),
          _path = $('.has-children .file_fold.bg').parent().attr('data-menu-path'),
          _type = parseInt($(this).parent().parent().attr('data-edit'));
      if ($(this).parent().parent().parent().attr('data-menu-path') === undefined && parseInt($(this).parent().parent().attr('data-group')) === 1) {
        // console.log('根目录')
        _path = $('.ace_catalogue_title').attr('title');
      }
      // 			return false;
      if (_file_or_dir === '') {
        $(this).prev().css('border', '1px solid #f34a4a');
        layer.tips(_type === 0 ? '文件目录不能为空' : (_type === 1 ? '文件名称不能空' : '新名称不能为空'), $(this).prev(), { tips: [1, '#f34a4a'], time: 0 });
        return false;
      } else if ($(this).prev().attr('data-type') == 0) {
        return false;
      }
      switch (_type) {
        case 0: //新建文件夹
          _this.event_create_dir({ path: _path + '/' + _file_or_dir });
          break;
        case 1: //新建文件
          _this.event_create_file({ path: _path + '/' + _file_or_dir });
          break;
        case 2: //重命名
          _this.event_rename_currency({ sfile: _path, dfile: _this.get_file_dir(_path, 1) + '/' + _file_or_dir });
          break;
      }
    });
    // 新建、重命名键盘事件
    $('.ace_catalogue_list').on('keyup', '.has-children .edit_file_group input', function (e) {
      var _type = $(this).parent().parent().attr('data-edit'),
          _arry = $('.has-children .file_fold.bg+ul>li');
      if (_arry.length == 0 && $(this).parent().parent().attr('data-group') === 1) _arry = $('.cd-accordion-menu>li')
      if (_type != 2) {
        for (var i = 0; i < _arry.length; i++) {
          if ($(_arry[i]).find('.file_title span').html() === $(this).val()) {
            $(this).css('border', '1px solid #f34a4a');
            $(this).attr('data-type', 0);
            layer.tips(_type == 0 ? '文件目录存在同名目录' : '文件名称存在同名文件', $(this)[0], { tips: [1, '#f34a4a'], time: 0 });
            return false
          }
        }
      }
      if (_type == 1 && $(this).val().indexOf('.')) $(this).prev().removeAttr('class').addClass(_this.get_file_suffix($(this).val()) + '-icon');
      $(this).attr('data-type', 1);
      $(this).css('border', '1px solid #528bff');
      layer.closeAll('tips');
      if (e.keyCode === 13) $(this).next().click();
      $('.ace_toolbar_menu').hide();
      $('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding,.ace_toolbar_menu .menu-files').hide();
      e.stopPropagation();
      e.preventDefault();
    });
    // 新建、重命名鼠标点击取消事件
    $('.ace_catalogue_list').on('click', '.has-children .edit_file_group .glyphicon-remove', function () {
      layer.closeAll('tips');
      if ($(this).parent().parent().parent().attr('data-menu-path')) {
        $(this).parent().parent().removeClass('edit_file_group').removeAttr('data-edit');
        $(this).parent().siblings().show();
        $(this).parent().remove();
        return false;
      }
      $(this).parent().parent().parent().remove();
    });
    //屏蔽浏览器右键菜单
    $('.ace_catalogue_list')[0].oncontextmenu = function () {
      return false;
    }
    $('.ace_conter_menu').dragsort({
      dragSelector: '.icon_file',
      itemSelector: 'li'
    });
    this.setEditorView();
    this.reader_file_dir_menu();
  },
  // 	设置本地存储，设置类型type：session或local
  setStorage: function (type, key, val) {
    if (type != "local" && type != "session") val = key, key = type, type = 'session';
    window[type + 'Storage'].setItem(key, val);
  },
  //获取指定本地存储，设置类型type：session或local
  getStorage: function (type, key) {
    if (type != "local" && type != "session") key = type, type = 'session';
    return window[type + 'Storage'].getItem(key);
  },
  //删除指定本地存储，设置类型type：session或local
  removeStorage: function (type, key) {
    if (type != "local" && type != "session") key = type, type = 'session';
    window[type + 'Storage'].removeItem(key);
  },
  // 	删除指定类型的所有存储信息
  clearStorage: function (type) {
    if (type != "local" && type != "session") key = type, type = 'session';
    window[type + 'Storage'].clear();
  },

  // 新建文件类型
  newly_file_type: function (that) {
    var _type = parseInt($(that).attr('data-type')),
        _active = $('.ace_catalogue .ace_catalogue_list .has-children .file_fold.bg'),
        _group = parseInt(_active.attr('data-group')),
        _path = _active.parent().attr('data-menu-path'), //当前文件夹新建
        _this = this;
    switch (_type) {
      case 0: //刷新目录
        _active.next().empty();
        _this.reader_file_dir_menu({
          el: _active.next(),
          path: _path,
          group: parseInt(_active.attr('data-group')) + 1,
          is_empty: true
        }, function () {
          layer.msg('刷新成功', { icon: 1 });
        });
        break;
      case 1: //打开文件
        _this.menu_path = _path;
        _this.reader_file_dir_menu({
          el: '.cd-accordion-menu',
          path: _this.menu_path,
          group: 1,
          is_empty: true
        });
        break;
      case 2: //新建文件
      case 3:
        if (this.get_file_dir(_path, 1) != this.menu_path) { //判断当前文件上级是否为显示根目录
          this.reader_file_dir_menu({ el: _active, path: _path, group: _group + 1 }, function (res) {
            _this.newly_file_type_dom(_active, _group, _type == 2 ? 0 : 1);
          });
        } else {
          _this.newly_file_type_dom(_active, _group, _type == 2 ? 0 : 1);
        }
        break;
      case 4: //文件重命名
        var _types = _active.attr('data-file');
        if (_active.hasClass('active')) {
          layer.msg('该文件已打开，无法修改名称', { icon: 0 });
          return false;
        }
        _active.attr('data-edit', 2);
        _active.addClass('edit_file_group');
        _active.find('.file_title').hide();
        _active.find('.glyphicon').hide();
        _active.prepend('<span class="file_input"><i class="' + (_types === 'Dir' ? 'folder' : (_this.get_file_suffix(_active.find('.file_title span').html()))) + '-icon"></i><input type="text" class="newly_file_input" value="' + (_active.find('.file_title span').html()) + '"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span><span class="glyphicon glyphicon-remove" aria-hidden="true"></span>')
        $('.file_fold .newly_file_input').width($('.file_fold .newly_file_input').parent().parent().parent().width() - ($('.file_fold .newly_file_input').parent().parent().attr('data-group') * 15 - 5) - 20 - 30 - 53);
        $('.file_fold .newly_file_input').focus();
        break;
      case 5:
        window.open('/download?filename=' + encodeURIComponent(_path));
        break;
      case 6:
        var is_files = _active.attr('data-file') === 'Files'
        layer.confirm(lan.get(is_files ? 'recycle_bin_confirm' : 'recycle_bin_confirm_dir', [_active.find('.file_title span').html()]), { title: is_files ? lan.files.del_file : lan.files.del_dir, closeBtn: 2, icon: 3 }, function (index) {
          _this[is_files ? 'del_file_req' : 'del_dir_req']({ path: _path }, function (res) {
            layer.msg(res.msg, { icon: res.status ? 1 : 2 });
            if (res.status) {
              if (_active.attr('data-group') != 1) _active.parent().parent().prev().addClass('bg')
              _this.reader_file_dir_menu(_this.refresh_config, function () {
                layer.msg(res.msg, { icon: 1 });
              });
            }
          });
        });
        break;
    }
  },
  // 新建文件和文件夹
  newly_file_type_dom: function (_active, _group, _type, _val) {
    var _html = '', _this = this, _nextLength = _active.next(':not(.ace_catalogue_menu)').length;
    if (_nextLength > 0) {
      _active.next().show();
      _active.find('.glyphicon').removeClass('glyphicon-menu-right').addClass('glyphicon-menu-down');
    }
    _html += '<li class="has-children children_' + (_group + 1) + '"><div class="file_fold edit_file_group group_' + (_group + 1) + '" data-group="' + (_group + 1) + '" data-edit="' + _type + '"><span class="file_input">';
    _html += '<i class="' + (_type == 0 ? 'folder' : (_type == 1 ? 'text' : (_this.get_file_suffix(_val || '')))) + '-icon"></i>'
    _html += '<input type="text" class="newly_file_input" value="' + (_val != undefined ? _val : '') + '">'
    _html += '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></span></div></li>'
    if (_nextLength > 0) {
      _active.next().prepend(_html);
    } else {
      _active.prepend(_html);
    }
    setTimeout(function () {
      $('.newly_file_input').focus()
    }, 100)
    $('.file_fold .newly_file_input').width($('.file_fold .newly_file_input').parent().parent().parent().width() - ($('.file_fold .newly_file_input').parent().parent().attr('data-group') * 15 - 5) - 20 - 30 - 53);
    return false;
  },
  // 通用重命名事件
  event_rename_currency: function (obj) {
    var _active = $('.ace_catalogue_list .has-children .file_fold.edit_file_group'), _this = this;
    this.rename_currency_req({ sfile: obj.sfile, dfile: obj.dfile }, function (res) {
      layer.msg(res.msg, { icon: res.status ? 1 : 2 });
      if (res.status) {
        _this.reader_file_dir_menu(_this.refresh_config, function () {
          layer.msg(res.msg, { icon: 1 });
        });
      } else {
        _active.find('.file_input').siblings().show();
        _active.find('.file_input').remove();
        _active.removeClass('edit_file_group').removeAttr('data-edit');
      }
    })
  },
  // 创建文件目录事件
  event_create_dir: function (obj) {
    var _this = this;
    this.create_dir_req({ path: obj.path }, function (res) {
      layer.msg(res.msg, { icon: res.status ? 1 : 2 });
      if (res.status) {
        _this.reader_file_dir_menu(_this.refresh_config, function () {
          layer.msg(res.msg, { icon: 1 });
        });
      }
    })
  },
  // 创建文件事件
  event_create_file: function (obj) {
    var _this = this;
    this.create_file_req({ path: obj.path }, function (res) {
      layer.msg(res.msg, { icon: res.status ? 1 : 2 });
      if (res.status) {
        _this.reader_file_dir_menu(_this.refresh_config, function () {
          layer.msg(res.msg, { icon: 1 });
          _this.openEditorView(obj.path);
        });
      }
    })
  },
  // 重命名请求
  rename_currency_req: function (obj, callback) {
    var loadT = layer.msg('正在重命名文件或目录，请稍候...', { time: 0, icon: 16, shade: [0.3, '#000'] });
    $.post("/files?action=MvFile", {
      sfile: obj.sfile,
      dfile: obj.dfile,
      rename: 'true'
    }, function (res) {
      layer.close(loadT);
      if (callback) callback(res);
    });
  },
  // 创建文件事件
  create_file_req: function (obj, callback) {
    var loadT = layer.msg('正在新建文件，请稍候...', { time: 0, icon: 16, shade: [0.3, '#000'] });
    $.post("/files?action=CreateFile", {
      path: obj.path
    }, function (res) {
      layer.close(loadT);
      if (callback) callback(res);
    });
  },
  // 创建目录请求
  create_dir_req: function (obj, callback) {
    var loadT = layer.msg('正在新建目录，请稍候...', { time: 0, icon: 16, shade: [0.3, '#000'] });
    $.post("/files?action=CreateDir", {
      path: obj.path
    }, function (res) {
      layer.close(loadT);
      if (callback) callback(res);
    });
  },
  // 删除文件请求
  del_file_req: function (obj, callback) {
    var loadT = layer.msg('正在删除文件，请稍候...', { time: 0, icon: 16, shade: [0.3, '#000'] });
    $.post("/files?action=DeleteFile", {
      path: obj.path
    }, function (res) {
      layer.close(loadT);
      if (callback) callback(res);
    });
  },
  // 删除目录请求
  del_dir_req: function (obj, callback) {
    var loadT = layer.msg('正在删除文件目录，请稍候...', { time: 0, icon: 16, shade: [0.3, '#000'] });
    $.post("/files?action=DeleteDir", {
      path: obj.path
    }, function (res) {
      layer.close(loadT);
      if (callback) callback(res);
    });
  },
  // 临时文件保存
  auto_save_temp: function (obj, callback) {
    // var loadT = layer.msg('正在新建目录，请稍候...',{time: 0,icon: 16,shade: [0.3, '#000']});
    $.post("/files?action=auto_save_temp", {
      filename: obj.filename,
      body: obj.body
    }, function (res) {
      layer.close(loadT);
      if (callback) callback(res);
    });
  },
  // 获取临时文件内容
  get_auto_save_body: function (obj, callback) {
    var loadT = layer.msg('正在获取自动保存文件信息，请稍候...', { time: 0, icon: 16, shade: [0.3, '#000'] });
    $.post("/files?action=get_auto_save_body", {
      filename: obj.filename
    }, function (res) {
      layer.close(loadT);
      if (callback) callback(res);
    });
  },
  // 恢复历史文件事件
  event_ecovery_file: function (that) {
    var _path = $(that).attr('data-path'), _history = new Number($(that).attr('data-history')), _this = this;
    var loadT = layer.open({
      type: 1,
      area: ['400px', '180px'],
      title: '恢复历史文件',
      content: '<div class="ace-clear-form">\
				<div class="clear-icon"></div>\
				<div class="clear-title">是否恢复历史文件&nbsp<span class="size_ellipsis" style="max-width:150px;vertical-align: top;" title="' + bt.format_data(_history) + '">' + bt.format_data(_history) + '</span>?</div>\
				<div class="clear-tips">恢复历史文件后，当前文件内容将会被替换！</div>\
				<div class="ace-clear-btn" style="">\
					<button type="button" class="btn btn-sm btn-default" style="margin-right:10px;" data-type="1">取消</button>\
					<button type="button" class="btn btn-sm btn-success" data-type="0">恢复历史文件</button>\
				</div>\
			</div>',
      success: function (layero, index) {
        $('.ace-clear-btn .btn').click(function () {
          var _type = $(this).attr('data-type');
          switch (_type) {
            case '0':
              _this.recovery_file_history({
                filename: _path,
                history: _history
              }, function (res) {
                layer.close(index);
                layer.msg(res.status ? '恢复历史文件成功' : '恢复历史文件失败', { icon: res.status ? 1 : 2 });
                if (res.status) {
                  if (_this.editor[_this.ace_active].historys_file) {
                    _this.removeEditor(_this.ace_active);
                  }
                  if ($('.ace_conter_menu>[title="' + _path + '"]').length > 0) {
                    $('.ace_header .refreshs').click();
                    layer.close(_this.layer_view);
                  }
                }
              });
              break;
            case '1':
              layer.close(index);
              break;
          }
        });
      }
    });
  },
  // 判断是否为历史文件
  is_file_history: function (_item) {
    if (_item == undefined) return false;
    if (_item.historys_file) {
      $('.ace_conter_tips').show();
      $('#ace_editor_' + _item.id).css('bottom', '50px');
      $('.ace_conter_tips .tips').html('只读文件，文件为' + _item.path + '，历史版本 [ ' + bt.format_data(new Number(_item.historys_active)) + ' ]<a href="javascript:;" class="ml35 btlink" style="margin-left:35px" data-path="' + _item.path + '" data-history="' + _item.historys_active + '">点击恢复当前历史版本</a>');
    } else {
      $('.ace_conter_tips').hide();
    }
  },
  // 判断文件是否打开
  is_file_open: function (path, callabck) {
    var is_state = false
    for (var i = 0; i < this.pathAarry.length; i++) {
      if (path === this.pathAarry[i]) is_state = true
    }
    if (callabck) {
      callabck(is_state);
    } else {
      return is_state;
    }
  },
  // 恢复文件历史
  recovery_file_history: function (obj, callback) {
    var loadT = layer.msg('正在恢复历史文件，请稍候...', { time: 0, icon: 16, shade: [0.3, '#000'] });
    $.post("/files?action=re_history", {
      filename: obj.filename,
      history: obj.history
    }, function (res) {
      layer.close(loadT);
      if (callback) callback(res);
    });
  },
  // 获取文件列表
  get_file_dir_list: function (obj, callback) {
    var loadT = layer.msg('正在获取文件列表，请稍候...', { time: 0, icon: 16, shade: [0.3, '#000'] }), _this = this;
    if (obj['p'] === undefined) obj['p'] = 1;
    if (obj['showRow'] === undefined) obj['showRow'] = 200;
    if (obj['sort'] === undefined) obj['sort'] = 'name';
    if (obj['reverse'] === undefined) obj['reverse'] = 'False';
    if (obj['search'] === undefined) obj['search'] = '';
    if (obj['all'] === undefined) obj['all'] = 'False';
    $.post("/files?action=GetDir&tojs=GetFiles", { p: obj.p, showRow: obj.showRow, sort: obj.sort, reverse: obj.reverse, path: obj.path, search: obj.search }, function (res) {
      layer.close(loadT);
      if (callback) callback(res);
    });
  },
  // 获取历史文件
  get_file_history: function (obj, callback) {
    var loadT = layer.msg('正在获取历史文件内容，请稍候...', { time: 0, icon: 16, shade: [0.3, '#000'] }), _this = this;
    $.post("/files?action=read_history", { filename: obj.filename, history: obj.history }, function (res) {
      layer.close(loadT);
      if (callback) callback(res);
    });
  },
  // 渲染文件列表
  reader_file_dir_menu: function (obj, callback) {
    var _path = getCookie('Path'), _this = this;
    if (obj === undefined) obj = {}
    if (obj['el'] === undefined) obj['el'] = '.cd-accordion-menu';
    if (obj['group'] === undefined) obj['group'] = 1;
    if (obj['p'] === undefined) obj['p'] = 1;
    if (obj['path'] === undefined) obj['path'] = _path;
    if (obj['search'] === undefined) obj['search'] = '';
    if (obj['is_empty'] === undefined) obj['is_empty'] = false;
    if (obj['all'] === undefined) obj['all'] = 'False'
    this.get_file_dir_list({ p: obj.p, path: obj.path, search: obj.search, all: obj.all }, function (res) {
      var _dir = res.DIR, _files = res.FILES, _dir_dom = '', _files_dom = '', _html = '';
      _this.menu_path = res.PATH;
      for (var i = 0; i < _dir.length; i++) {
        var _data = _dir[i].split(';');
        if (_data[0] === '__pycache__') continue;
        _dir_dom += '<li class="has-children children_' + obj.group + '" title="' + (obj.path + '/' + _data[0]) + '" data-menu-path="' + (obj.path + '/' + _data[0]) + '" data-size="' + (_data[1]) + '">\
					<div class="file_fold group_'+ obj.group + '" data-group="' + obj.group + '" data-file="Dir">\
						<span class="glyphicon glyphicon-menu-right"></span>\
						<span class="file_title"><i class="folder-icon"></i><span>'+ _data[0] + '</span></span>\
					</div>\
					<ul data-group=""></ul>\
					<span class="has_children_separator"></span>\
				</li>';
      }
      for (var j = 0; j < _files.length; j++) {
        var _data = _files[j].split(';');
        if (_data[0].indexOf('.pyc') !== -1) continue;
        _files_dom += '<li class="has-children" title="' + (obj.path + '/' + _data[0]) + '" data-menu-path="' + (obj.path + '/' + _data[0]) + '" data-size="' + (_data[1]) + '" data-suffix="' + _this.get_file_suffix(_data[0]) + '">\
					<div class="file_fold  group_'+ obj.group + '" data-group="' + obj.group + '" data-file="Files">\
						<span class="file_title"><i class="'+ _this.get_file_suffix(_data[0]) + '-icon text-icon"></i><span>' + _data[0] + '</span></span>\
					</div>\
				</li>';
      }
      if (res.PATH !== '/' && obj['group'] === 1) {
        $('.upper_level').attr('data-menu-path', _this.get_file_dir(res.PATH, 1));
        $('.ace_catalogue_title').html('目录：' + res.PATH).attr('title', res.PATH);
        $('.upper_level').html('<i class="glyphicon glyphicon-share-alt" aria-hidden="true"></i>上一级')
      } else if (res.PATH === '/') {
        $('.upper_level').html('<i class="glyphicon glyphicon-hdd" aria-hidden="true"></i>根目录')
      }
      if (obj.is_empty) $(obj.el).empty();
      $(obj.el).append(_html + _dir_dom + _files_dom);
      if (callback) callback(res);
    });
  },
  // 获取文件目录位置
  get_file_dir: function (path, num) {
    var _arry = path.split('/');
    if (path === '/') return '/';
    _arry.splice(-1, num);
    return _arry == '' ? '/' : _arry.join('/');
  },
  // 获取文件全称
  get_file_suffix: function (fileName) {
    var filenames = fileName.match(/\.([0-9A-z]*)$/);
    filenames = (filenames == null ? 'text' : filenames[1]);
    for (var name in this.aceConfig.supportedModes) {
      var data = this.aceConfig.supportedModes[name], suffixs = data[0].split('|'), filename = name.toLowerCase();
      for (var i = 0; i < suffixs.length; i++) {
        if (filenames == suffixs[i]) return filename;
      }
    }
    return 'text';
  },
  // 设置编辑器视图
  setEditorView: function () {
    var aceEditorHeight = $('.aceEditors').height(), _this = this;
    var autoAceHeight = setInterval(function () {
      var page_height = $('.aceEditors').height();
      var ace_conter_menu = $('.ace_conter_menu').height();
      var ace_conter_toolbar = $('.ace_conter_toolbar').height();
      var _height = page_height - ($('.pull-down .glyphicon').hasClass('glyphicon-menu-down') ? 35 : 0) - ace_conter_menu - ace_conter_toolbar - 42;
      $('.ace_conter_editor').height(_height);
      if (aceEditorHeight == $('.aceEditors').height()) {
        if (_this.ace_active) _this.editor[_this.ace_active].ace.resize();
        clearInterval(autoAceHeight);
      } else {
        aceEditorHeight = $('.aceEditors').height();
      }
    }, 200);
  },
  // 获取文件编码列表
  getEncodingList: function (type) {
    var _option = '';
    for (var i = 0; i < this.aceConfig.encodingList.length; i++) {
      var item = this.aceConfig.encodingList[i] == type.toUpperCase();
      _option += '<li data- data-value="' + this.aceConfig.encodingList[i] + '" ' + (item ? 'class="active"' : '') + '>' + this.aceConfig.encodingList[i] + (item ? '<span class="icon"><i class="glyphicon glyphicon-ok" aria-hidden="true"></i></span>' : '') + '</li>';
    }
    $('.menu-encoding ul').html(_option);
  },
  // 获取文件关联列表
  getRelevanceList: function (fileName) {
    var _option = '', _top = 0, fileType = this.getFileType(fileName), _set_tops = 0;
    for (var name in this.aceConfig.supportedModes) {
      var data = this.aceConfig.supportedModes[name], item = (name == fileType.name);
      _option += '<li data-height="' + _top + '" data-rule="' + this.aceConfig.supportedModes[name] + '" data-value="' + name + '" ' + (item ? 'class="active"' : '') + '>' + (this.aceConfig.nameOverrides[name] || name) + (item ? '<span class="icon"><i class="glyphicon glyphicon-ok" aria-hidden="true"></i></span>' : '') + '</li>'
      if (item) _set_tops = _top
      _top += 35;
    }
    $('.menu-files ul').html(_option);
    $('.menu-files ul').scrollTop(_set_tops);
  },
  // 搜索文件关联
  searchRelevance: function (search) {
    if (search == undefined) search = '';
    $('.menu-files ul li').each(function (index, el) {
      var val = $(this).attr('data-value').toLowerCase(),
          rule = $(this).attr('data-rule'),
          suffixs = rule.split('|'),
          _suffixs = false;
      search = search.toLowerCase();
      for (var i = 0; i < suffixs.length; i++) {
        if (suffixs[i].indexOf(search) > -1) _suffixs = true
      }
      if (search == '') {
        $(this).removeAttr('style');
      } else {
        if (val.indexOf(search) == -1) {
          $(this).attr('style', 'display:none');
        } else {
          $(this).removeAttr('style');
        }
        if (_suffixs) $(this).removeAttr('style')
      }
    });
  },
  // 设置编码类型
  setEncodingType: function (encode) {
    this.getEncodingList('UTF-8');
    $('.menu-encoding ul li').click(function (e) {
      layer.msg('设置文件编码：' + $(this).attr('data-value'));
      $(this).addClass('active').append('<span class="icon"><i class="glyphicon glyphicon-ok" aria-hidden="true"></i></span>').siblings().removeClass('active').find('span').remove();
    });
  },
  // 更新状态栏
  currentStatusBar: function (id) {
    var _item = this.editor[id];
    if (_item == undefined) {
      this.removerStatusBar();
      return false;
    }
    $('.ace_conter_toolbar [data-type="cursor"]').html('行<i class="cursor-row">1</i>,列<i class="cursor-line">0</i>');
    $('.ace_conter_toolbar [data-type="history"]').html('历史版本：<i>' + (_item.historys.length === 0 ? '无' : _item.historys.length + '份') + '</i>');
    $('.ace_conter_toolbar [data-type="path"]').html('文件位置：<i title="' + _item.path + '">' + _item.path + '</i>');
    $('.ace_conter_toolbar [data-type="tab"]').html(_item.softTabs ? '空格：<i>' + _item.tabSize + '</i>' : '制表符长度：<i>' + _item.tabSize + '</i>');
    $('.ace_conter_toolbar [data-type="encoding"]').html('编码：<i>' + _item.encoding.toUpperCase() + '</i>');
    var readOnly = $('.ace_conter_toolbar [data-type="readOnly"]')
    if(_item.readOnly){
      readOnly.show().text('只读模式').css('background','#ff9200')
    }else{
      readOnly.hide()
    }
    $('.ace_conter_toolbar [data-type="lang"]').html('语言：<i>' + _item.type + '</i>');
    $('.ace_conter_toolbar span').attr('data-id', id);
    $('.file_fold').removeClass('bg');
    $('[data-menu-path="' + (_item.path) + '"]').find('.file_fold').addClass('bg');
    if (_item.historys_file) {
      $('.ace_conter_toolbar [data-type="history"]').hide();
    } else {
      $('.ace_conter_toolbar [data-type="history"]').show();
    }
    _item.ace.resize();
  },
  // 清除状态栏
  removerStatusBar: function () {
    $('.ace_conter_toolbar [data-type="history"]').html('');
    $('.ace_conter_toolbar [data-type="path"]').html('');
    $('.ace_conter_toolbar [data-type="tab"]').html('');
    $('.ace_conter_toolbar [data-type="cursor"]').html('');
    $('.ace_conter_toolbar [data-type="encoding"]').html('');
    $('.ace_conter_toolbar [data-type="lang"]').html('');
    $('.ace_conter_toolbar [data-type="readOnly"]').hide();
  },
  // 创建ACE编辑器-对象
  creationEditor: function (obj, callabck) {
    var _this = this;
    $('#ace_editor_' + obj.id).text(obj.data || '');
    $('.ace_conter_editor .ace_editors').css('fontSize', _this.fontSize + 'px');
    if (this.editor == null) this.editor = {};
    this.editor[obj.id] = {
      ace: ace.edit("ace_editor_" + obj.id, {
        theme: "ace/theme/" + _this.aceConfig.aceEditor.editorTheme, //主题
        mode: "ace/mode/" + (obj.fileName != undefined ? obj.mode : 'text'), // 语言类型
        wrap: _this.aceConfig.aceEditor.wrap,
        showInvisibles: _this.aceConfig.aceEditor.showInvisibles,
        showPrintMargin: false,
        enableBasicAutocompletion: true,
        enableSnippets: _this.aceConfig.aceEditor.enableSnippets,
        enableLiveAutocompletion: _this.aceConfig.aceEditor.enableLiveAutocompletion,
        useSoftTabs: _this.aceConfig.aceEditor.useSoftTabs,
        tabSize: _this.aceConfig.aceEditor.tabSize,
        keyboardHandler: 'sublime',
        readOnly: obj.readOnly === undefined ? false : obj.readOnly
      }), //ACE编辑器对象
      id: obj.id,
      wrap: _this.aceConfig.aceEditor.wrap, //是否换行
      path: obj.path,
      tabSize: _this.aceConfig.aceEditor.tabSize,
      softTabs: _this.aceConfig.aceEditor.useSoftTabs,
      fileName: obj.fileName,
      enableSnippets: true, //是否代码提示
      encoding: (obj.encoding !== undefined ? obj.encoding : 'utf-8'), //编码类型
      mode: (obj.fileName !== undefined ? obj.mode : 'text'), //语言类型
      type: obj.type,
      fileType: 0, //文件状态
      historys: obj.historys,
      historys_file: obj.historys_file === undefined ? false : obj.historys_file,
      historys_active: obj.historys_active === '' ? false : obj.historys_active,
      readOnly: obj.readOnly === undefined ? false : obj.readOnly,
      st_mtime: obj.st_mtime
    };
    var ACE = this.editor[obj.id];
    ACE.ace.moveCursorTo(0, 0); //设置鼠标焦点
    ACE.ace.resize(); //设置自适应
    if(!ACE.readOnly) ACE.ace.focus()
    ACE.ace.on('focus', function () {
      var active = aceEditor.editor[aceEditor.ace_active]
      if(active.readOnly) layer.msg('当前文件只读，暂不支持修改',{icon:0})
    })
    ACE.ace.commands.addCommand({
      name: '保存文件',
      bindKey: {
        win: 'Ctrl-S',
        mac: 'Command-S'
      },
      exec: function (editor) {
        _this.saveFileMethod(ACE);
      },
      readOnly: false // 如果不需要使用只读模式，这里设置false
    });
    ACE.ace.commands.addCommand({
      name: '跳转行',
      bindKey: {
        win: 'Ctrl-I',
        mac: 'Command-I'
      },
      exec: function (editor) {
        $('.ace_header .jumpLine').click();
      },
      readOnly: false // 如果不需要使用只读模式，这里设置false
    })
    // 获取光标位置
    ACE.ace.getSession().selection.on('changeCursor', function (e) {
      var _cursor = ACE.ace.selection.getCursor();
      $('[data-type="cursor"]').html('行<i class="cursor-row">' + (_cursor.row + 1) + '</i>,列<i class="cursor-line">' + _cursor.column + '</i>');
    });

    // 触发修改内容
    ACE.ace.getSession().on('change', function (editor) {
      $('.item_tab_' + ACE.id + ' .icon-tool').addClass('glyphicon-exclamation-sign').removeClass('glyphicon-remove').attr('data-file-state', '1');
      ACE.fileType = 1;
      $('.ace_toolbar_menu').hide();
    });
    this.currentStatusBar(ACE.id);
    this.is_file_history(ACE);
  },
  // 保存文件方法
  saveFileMethod: function (ACE) {
    var that = this;
    if ($('.item_tab_' + ACE.id + ' .icon-tool').attr('data-file-state') == 0) {
      layer.msg('当前文件未修改，无需保存!');
      return false;
    }
    $('.item_tab_' + ACE.id + ' .icon-tool').attr('title', '保存文件中，请稍候..').removeClass('glyphicon-exclamation-sign').addClass('glyphicon-repeat');
    layer.msg('保存文件中，请稍候<img src="/static/img/ns-loading.gif" style="width:15px;margin-left:5px">', { icon: 0 });
    this.saveFileBody({
      path: ACE.path,
      data: ACE.ace.getValue(),
      encoding: ACE.encoding,
      st_mtime: ACE.st_mtime
    }, function (res) {
      that.editor[ACE.id].st_mtime = res.st_mtime
      ACE.fileType = 0;
      $('.item_tab_' + ACE.id + ' .icon-tool').attr('data-file-state', '0').removeClass('glyphicon-repeat').addClass('glyphicon-remove');
    }, function (res) {
      ACE.fileType = 1;
      $('.item_tab_' + ACE.id + ' .icon-tool').attr('data-file-state', '1').removeClass('glyphicon-repeat').addClass('glyphicon-exclamation-sign');
    });
  },
  // 获取文件模型
  getFileType: function (fileName) {
    var filenames = fileName.match(/\.([0-9A-z]*)$/);
    filenames = (filenames == null ? 'text' : filenames[1]);
    for (var name in this.aceConfig.supportedModes) {
      var data = this.aceConfig.supportedModes[name], suffixs = data[0].split('|'), filename = name.toLowerCase();
      for (var i = 0; i < suffixs.length; i++) {
        if (filenames == suffixs[i]) {
          return { name: name, mode: filename };
        }
      }
    }
    return { name: 'Text', mode: 'text' };
  },
  // 新建编辑器视图-方法
  addEditorView: function (type, conifg) {
    if (type == undefined) type = 0
    var _index = this.editorLength, _id = bt.get_random(8);
    $('.ace_conter_menu .item').removeClass('active');
    $('.ace_conter_editor .ace_editors').removeClass('active');
    $('.ace_conter_menu').append('<li class="item active item_tab_' + _id + '" data-type="shortcutKeys" data-id="' + _id + '" >\
			<div class="ace_item_box">\
				<span class="icon_file"><i class="text-icon"></i></span>\
				<span>'+ (type ? conifg.title : ('新建文件-' + _index)) + '</span>\
				<i class="glyphicon icon-tool glyphicon-remove" aria-hidden="true" data-file-state="0" data-title="'+ (type ? conifg.title : ('新建文件-' + _index)) + '"></i>\
			</div>\
		</li>');
    $('#ace_editor_' + _id).siblings().removeClass('active');
    $('.ace_conter_editor').append('<div id="ace_editor_' + _id + '" class="ace_editors active">' + (type ? aceShortcutKeys.innerHTML : '') + '</div>');
    switch (type) {
      case 0:
        this.creationEditor({ id: _id });
        this.editorLength = this.editorLength + 1;
        break;
      case 1:
        this.removerStatusBar();
        this.editorLength = this.editorLength + 1;
        break;
    }
  },
  // 删除编辑器视图-方法
  removeEditor: function (id) {
    if (id == undefined) id = this.ace_active;
    if ($('.item_tab_' + id).next().length != 0 && this.editorLength != 1) {
      $('.item_tab_' + id).next().click();
    } else if ($('.item_tab_' + id).prev.length != 0 && this.editorLength != 1) {
      $('.item_tab_' + id).prev().click();
    }
    $('.item_tab_' + id).remove();
    $('#ace_editor_' + id).remove();
    this.editorLength--;
    if (this.editor[id] == undefined) return false;
    for (var i = 0; i < this.pathAarry.length; i++) {
      if (this.pathAarry[i] == this.editor[id].path) {
        this.pathAarry.splice(i, 1);
      }
    }
    if (!this.editor[id].historys_file) $('[data-menu-path="' + (this.editor[id].path) + '"]').find('.file_fold').removeClass('active bg');
    this.editor[id].ace.destroy();
    delete this.editor[id];
    if (this.editorLength === 0) {
      this.ace_active = '';
      this.pathAarry = [];
      this.removerStatusBar();
    } else {
      this.currentStatusBar(this.ace_active);
    }
    if (this.ace_active != '') this.is_file_history(this.editor[this.ace_active]);
  },
  // 打开历史文件文件-方法
  openHistoryEditorView: function (obj, callback) {
    // 文件类型（type，列如：JavaScript） 、文件模型（mode，列如：text）、文件标识（id,列如：x8AmsnYn）、文件编号（index,列如：0）、文件路径 (path，列如：/www/root/)
    var _this = this, path = obj.filename, paths = path.split('/'), _fileName = paths[paths.length - 1], _fileType = this.getFileType(_fileName), _type = _fileType.name, _mode = _fileType.mode, _id = bt.get_random(8), _index = this.editorLength;
    this.get_file_history({ filename: obj.filename, history: obj.history }, function (res) {
      _this.pathAarry.push(path);
      $('.ace_conter_menu .item').removeClass('active');
      $('.ace_conter_editor .ace_editors').removeClass('active');
      $('.ace_conter_menu').append('<li class="item active item_tab_' + _id + '" title="' + path + '" data-type="' + _type + '" data-mode="' + _mode + '" data-id="' + _id + '" data-fileName="' + _fileName + '">' +
          '<div class="ace_item_box">' +
          '<span class="icon_file"><img src="/static/img/ico-history.png"></span><span title="' + path + ' 历史版本[ ' + bt.format_data(obj.history) + ' ]' + '">' + _fileName + '</span>' +
          '<i class="glyphicon glyphicon-remove icon-tool" aria-hidden="true" data-file-state="0" data-title="' + _fileName + '"></i>' +
          '</div>' +
          '</li>');
      $('.ace_conter_editor').append('<div id="ace_editor_' + _id + '" class="ace_editors active"></div>');
      $('[data-paths="' + path + '"]').find('.file_fold').addClass('active bg');
      _this.ace_active = _id;
      _this.editorLength = _this.editorLength + 1;
      _this.creationEditor({ id: _id, fileName: _fileName, path: path, mode: _mode, encoding: res.encoding, data: res.data, type: _type, historys: res.historys, readOnly: true, historys_file: true, historys_active: obj.history });
      if (callback) callback(res);
    });
  },
  // 打开编辑器文件-方法
  openEditorView: function (path, callback) {
    //最小化后，再点文件编辑，还原编辑器窗口
    if(aceEditor.editorStatus === -1) $('.layui-layer-maxmin').click()
    if (path === undefined) return false;
    // 文件类型（type，列如：JavaScript） 、文件模型（mode，列如：text）、文件标识（id,列如：x8AmsnYn）、文件编号（index,列如：0）、文件路径 (path，列如：/www/root/)
    var _this = this, paths = path.split('/'), _fileName = paths[paths.length - 1], _fileType = this.getFileType(_fileName), _type = _fileType.name, _mode = _fileType.mode, _id = bt.get_random(8), _index = this.editorLength;
    _this.is_file_open(path, function (is_state) {
      if (is_state) {
        $('.ace_conter_menu').find('[title="' + path + '"]').click();
      } else {
        _this.getFileBody({ path: path }, function (res) {
          _this.pathAarry.push(path);
          $('.ace_conter_menu .item').removeClass('active');
          $('.ace_conter_editor .ace_editors').removeClass('active');
          $('.ace_conter_menu').append('<li class="item active item_tab_' + _id + '" title="' + path + '" data-type="' + _type + '" data-mode="' + _mode + '" data-id="' + _id + '" data-fileName="' + _fileName + '">' +
              '<div class="ace_item_box">' +
              '<span class="icon_file"><i class="' + _mode + '-icon"></i></span><span title="' + path + '">' + _fileName + '</span>' +
              '<i class="glyphicon glyphicon-remove icon-tool" aria-hidden="true" data-file-state="0" data-title="' + _fileName + '"></i>' +
              '</div>' +
              '</li>');
          $('.ace_conter_editor').append('<div id="ace_editor_' + _id + '" class="ace_editors active" style="font-size:' + aceEditor.aceConfig.aceEditor.fontSize + 'px"></div>');
          $('[data-menu-path="' + path + '"]').find('.file_fold').addClass('active bg');
          _this.ace_active = _id;
          _this.editorLength = _this.editorLength + 1;
          if(res.only_read && res.size > 3145928) layer.msg('文件大小超过3MB，仅显示最新的10000行数据',{icon:0,area:'380px'});
          _this.creationEditor({ id: _id, fileName: _fileName, path: path, mode: _mode, encoding: res.encoding, data: res.data, type: _type, historys: res.historys, readOnly: res.only_read, size: res.size, st_mtime: res.st_mtime });
          if (callback) callback(res, _this.editor[_this.ace_active]);
        });
      }
    });
    $('.ace_toolbar_menu').hide();
  },
  // 获取收藏夹列表-方法
  getFavoriteList: function () { },
  // 获取文件列表-请求
  getFileList: function () { },
  // 获取文件内容-请求
  getFileBody: function (obj, callback) {
    var loadT = layer.msg('正在获取文件内容，请稍候...', { time: 0, icon: 16, shade: [0.3, '#000'] }), _this = this;
    $.post("/files?action=GetFileBody", "path=" + encodeURIComponent(obj.path), function (res) {
      layer.close(loadT);
      if (!res.status) {
        if (_this.editorLength === 0) layer.closeAll();
        layer.msg(res.msg, { icon: 2 });

        return false;
      } else {
        if (!aceEditor.isAceView) {
          var _path = obj.path.split('/');
          layer.msg('已打开文件【' + (_path[_path.length - 1]) + '】');
        }
      }
      if (callback) callback(res);
    });
  },
  // 保存文件内容-请求
  saveFileBody: function (obj, success, error) {
    $.ajax({
      type: 'post',
      url: '/files?action=SaveFileBody',
      timeout: 7000, //设置保存超时时间
      data: {
        data: obj.data,
        encoding: obj.encoding.toLowerCase(),
        path: obj.path,
        st_mtime: obj.st_mtime
      },
      success: function (rdata) {
        if (rdata.status) {
          if (success) success(rdata)
        } else {
          if (error) error(rdata)
        }
        if (!obj.tips){
          if(!rdata.status){
            layer.msg(rdata.msg,{icon:2,closeBtn:2,time:0})
          }else {
            layer.msg(rdata.msg,{icon:1})
          }
        }
      },
      error: function (err) {
        if (error) error(err)
      }
    });
  },
  // 	保存ace配置
  saveAceConfig: function (data, callback) {
    var loadT = layer.msg('正在设置配置文件，请稍候...', { time: 0, icon: 16, shade: [0.3, '#000'] }), _this = this;
    this.saveFileBody({
      path: '/www/server/panel/BTPanel/static/editor/ace.editor.config.json',
      data: JSON.stringify(data),
      encoding: 'utf-8',
      tips: true,
    }, function (rdata) {
      layer.close(loadT);
      _this.setStorage('aceConfig', JSON.stringify(data));
      if (callback) callback(rdata);
    });
  },
  // 获取配置文件
  getAceConfig: function (callback) {
    var loadT = layer.msg('正在获取配置文件，请稍候...', { time: 0, icon: 16, shade: [0.3, '#000'] }), _this = this;
    this.getFileBody({ path: '/www/server/panel/BTPanel/static/editor/ace.editor.config.json' }, function (rdata) {
      layer.close(loadT);
      _this.setStorage('aceConfig', JSON.stringify(rdata.data));
      if (callback) callback(JSON.parse(rdata.data));
    });
  },
  // 递归保存文件
  saveAllFileBody: function (arry, num, callabck) {
    var _this = this;
    if (typeof num == "function") {
      callabck = num; num = 0;
    } else if (typeof num == "undefined") {
      num = 0;
    }
    if (num == arry.length) {
      if (callabck) callabck();
      layer.msg('全部保存成功', { icon: 1 });
      return false;
    }
    aceEditor.saveFileBody({
      path: arry[num].path,
      data: arry[num].data,
      encoding: arry[num].encoding,
      st_mtime:arry[num].st_mtime
    }, function (res) {
      aceEditor.editor[arry[num].id].st_mtime = res.st_mtime
      num = num + 1;
      aceEditor.saveAllFileBody(arry, num, callabck);
    });
  }
}

function openEditorView (type, path, callback) {
  var paths = path.split('/'),
      _fileName = paths[paths.length - 1],
      _aceTmplate = document.getElementById("aceTmplate").innerHTML;
  _aceTmplate = _aceTmplate.replace(/\<\\\/script\>/g, '</script>');
  if (aceEditor.editor !== null) {
    if (aceEditor.isAceView == false) {
      aceEditor.isAceView = true;
      $('.aceEditors .layui-layer-max').click();
    }
    aceEditor.openEditorView(path);
    return false;
  }
  var r = layer.open({
    type: 1,
    maxmin: true,
    shade: false,
    anim:-1,
    area: ['80%', '80%'],
    title: "在线文本编辑器",
    skin: 'aceEditors',
    zIndex: 19999,
    content: _aceTmplate,
    success: function (layero, index) {
      function set_edit_file () {
        aceEditor.ace_active = '';
        aceEditor.eventEditor();
        ace.require("/ace/ext/language_tools");
        ace.config.set("modePath", "/static/editor");
        ace.config.set("workerPath", "/static/editor");
        ace.config.set("themePath", "/static/editor");
        aceEditor.openEditorView(path, callback);
        $('#ace_conter').addClass(aceEditor.aceConfig.aceEditor.editorTheme);
        $('.aceEditors .layui-layer-min').click(function (e) {
          aceEditor.setEditorView();
        });
        $('.aceEditors .layui-layer-max').click(function (e) {
          aceEditor.setEditorView();
        });
      }
      var aceConfig = aceEditor.getStorage('aceConfig');
      if (aceConfig == null) {
        // 获取编辑器配置
        aceEditor.getAceConfig(function (res) {
          aceEditor.aceConfig = res; // 赋值配置参数
          set_edit_file();
        });
      } else {
        aceEditor.aceConfig = JSON.parse(aceConfig);
        typeof aceEditor.aceConfig == 'string' ? aceEditor.aceConfig = JSON.parse(aceEditor.aceConfig) : ''
        set_edit_file();
      }
    },
    cancel: function () {
      for (var item in aceEditor.editor) {
        if (aceEditor.editor[item].fileType == 1) {
          layer.open({
            type: 1,
            area: ['400px', '180px'],
            title: '保存提示',
            content: '<div class="ace-clear-form">\
							<div class="clear-icon"></div>\
							<div class="clear-title">检测到文件未保存，是否保存文件更改？</div>\
							<div class="clear-tips">如果不保存，更改会丢失！</div>\
							<div class="ace-clear-btn" style="">\
								<button type="button" class="btn btn-sm btn-default" style="float:left" data-type="2">不保存文件</button>\
								<button type="button" class="btn btn-sm btn-default" style="margin-right:10px;" data-type="1">取消</button>\
								<button type="button" class="btn btn-sm btn-success" data-type="0">保存文件</button>\
							</div>\
						</div>',
            success: function (layers, indexs) {
              $('.ace-clear-btn button').click(function () {
                var _type = $(this).attr('data-type');
                switch (_type) {
                  case '2':
                    aceEditor.editor = null;
                    aceEditor.editorLength = 0;
                    aceEditor.pathAarry = [];
                    layer.closeAll();
                    break;
                  case '1':
                    layer.close(indexs);
                    break;
                  case '0':
                    var _arry = [], editor = aceEditor['editor'];
                    for (var item in editor) {
                      _arry.push({
                        id: editor[item].id,
                        path: editor[item]['path'],
                        data: editor[item]['ace'].getValue(),
                        encoding: editor[item]['encoding'],
                      })
                    }
                    aceEditor.saveAllFileBody(_arry, function () {
                      $('.ace_conter_menu>.item').each(function (el, indexx) {
                        var _id = $(this).attr('data-id');
                        $(this).find('i').removeClass('glyphicon-exclamation-sign').addClass('glyphicon-remove').attr('data-file-state', '0')
                        aceEditor.editor[_id].fileType = 0;
                      });
                      aceEditor.editor = null;
                      aceEditor.pathAarry = [];
                      layer.closeAll();
                    });
                    break;
                }
              });
            }
          });
          return false;
        }
      }
    },
    full: function (layero, index) {
      //最大化
      aceEditor.editorStatus = 1
    },
    min: function (layero, index) {
      //最小化
      aceEditor.editorStatus = -1
    },
    restore: function (layero, index) {
      //还原
      aceEditor.editorStatus = 0
    },
    end: function () {
      aceEditor.ace_active = '';
      aceEditor.editor = null;
      aceEditor.pathAarry = [];
      aceEditor.menu_path = '';
    }
  });
}


/**
 * AES加密
 * @param {string} s_text 等待加密的字符串
 * @param {string} s_key 16位密钥
 * @param {array} ctx 可选，默认为 { mode: CryptoJS.mode.ECB,padding: CryptoJS.pad.ZeroPadding }
 * @return {string}
 */
function aes_encrypt (s_text, s_key, ctx) {
  if (ctx == undefined) ctx = { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.ZeroPadding }
  var key = CryptoJS.enc.Utf8.parse(s_key);
  var encrypt_data = CryptoJS.AES.encrypt(s_text, key, ctx);
  return encrypt_data.toString();
}

/**
 * AES解密
 * @param {string} s_text 等待解密的密文
 * @param {string} s_key 16位密钥
 * @param {array} ctx 可选，默认为 { mode: CryptoJS.mode.ECB,padding: CryptoJS.pad.ZeroPadding }
 * @return {string}
 */
function aes_decrypt (s_text, s_key, ctx) {
  if (ctx == undefined) ctx = { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.ZeroPadding }
  var key = CryptoJS.enc.Utf8.parse(s_key);
  var decrypt_data = CryptoJS.AES.decrypt(s_text, key, ctx);
  return decrypt_data.toString(CryptoJS.enc.Utf8);
}

/**
 * ajax内容解密
 * @param {string} data 加密的响应数据
 * @param {string} stype ajax中定义的数据类型
 * @return {string} 解密后的响应数据
 */
function ajax_decrypt (data, stype) {
  if (!data) return data;
  if (data.substring(0, 6) == "BT-CRT") {
    var token = $("#request_token_head").attr("token")
    var pwd = token.substring(0, 8) + token.substring(40, 48)
    data = aes_decrypt(data.substring(6), pwd);
    if (stype == undefined) {
      stype = '';
    }
    if (stype.toLowerCase() != 'json') {
      data = JSON.parse(data);
    }
  }
  return data
}
/**
 * 格式化form_data数据，并加密
 * @param {string} form_data 加密前的form_data数据
 * @return {string} 加密后的form_data数据
 */
function format_form_data (form_data) {
  var data_tmp = form_data.split('&');
  var form_info = {}
  var token = $("#request_token_head").attr("token")
  if (!token) return form_data;
  var pwd = token.substring(0, 8) + token.substring(40, 48)
  for (var i = 0; i < data_tmp.length; i++) {
    var tmp = data_tmp[i].split('=');
    if (tmp.length < 2) continue;
    var val = decodeURIComponent(tmp[1].replace(/\+/g, '%20'));
    if (val.length > 3) {
      form_info[tmp[0]] = 'BT-CRT' + aes_encrypt(val, pwd);
    } else {
      form_info[tmp[0]] = val;
    }

  }
  return $.param(form_info);
}

function ajax_encrypt (request) {
  if (!this.type || !this.data || !this.contentType) return;
  if ($("#panel_debug").attr("data") == 'True') return;
  if ($("#panel_debug").attr("data-pyversion") == '2') return;
  if (this.type == 'POST' && this.data.length > 1) {
    this.data = format_form_data(this.data);
  }
}

var gl_error_body = '';
function ajaxSetup () {
  var my_headers = {};
  var request_token_ele = document.getElementById("request_token_head");
  if (request_token_ele) {
    var request_token = request_token_ele.getAttribute('token');
    if (request_token) {
      my_headers['x-http-token'] = request_token
    }
  }
  var request_token_key = window.location.protocol.indexOf("https:") == 0 ? "https_request_token" : "request_token";
  request_token_cookie = getCookie(request_token_key);
  if (request_token_cookie) {
    my_headers['x-cookie-token'] = request_token_cookie
  }

  if (my_headers) {
    $.ajaxSetup({ 
      headers: my_headers,
      error: function (jqXHR, textStatus, errorThrown) {
        var pro = parseInt(bt.get_cookie('pro_end') || -1);
        var ltd = parseInt(bt.get_cookie('ltd_end')  || -1);
        isBuy = false;
        if(pro == 0 || ltd > 0) isBuy = true   //付费

        if (!jqXHR.responseText) return;
        //会话失效时自动跳转到登录页面
        if (typeof (jqXHR.responseText) == 'string') {
          if ((jqXHR.responseText.indexOf('/static/favicon.ico') != -1 && jqXHR.responseText.indexOf('/static/img/qrCode.png') != -1) || jqXHR.responseText.indexOf('<!DOCTYPE html>') === 0) {
            window.location.href = "/login"
            return
          }
        }
        if (typeof (String.prototype.trim) === "undefined") {
          String.prototype.trim = function () {
            return String(this).replace(/^\s+|\s+$/g, '');
          };
        }

        error_key = 'We need to make sure this has a favicon so that the debugger does';
        error_find = jqXHR.responseText.indexOf(error_key)
        gl_error_body = jqXHR.responseText;
        if (jqXHR.status == 500 && jqXHR.responseText.indexOf('运行时发生错误') != -1) {
          // if (jqXHR.responseText.indexOf('请先绑定宝塔帐号!') != -1) {
          //   if ($('.libLogin').length > 0 || $('.radio_account_view').length > 0) return false;
          //   bt.pub.bind_btname(function () {
          //     window.location.reload();
          //   });
          //   return;
          // }
          if (jqXHR.responseText.indexOf('建议按顺序逐一尝试以下解决方案') != -1){
            error_msg = jqXHR.responseText.split('Error: ')[1].split("</pre>")[0].replace("面板运行时发生错误:",'').replace("public.PanelError:",'').trim();
          }else{
            error_msg = '<h3>' + jqXHR.responseText.split('<h3>')[1].split('</h3>')[0] + '</h3>'
            error_msg += '<a style="color:dimgrey;font-size:none">' + jqXHR.responseText.split('<h4 style="font-size: none;">')[1].split("</h4>")[0].replace("面板运行时发生错误:",'').replace("public.PanelError:",'').trim() + '</a>';
          }

          error_msg += "<br><a class='btlink' onclick='show_error_message()'> >>点击查看详情</a>"+(isBuy?"<span class='ml33'><span class='wechatEnterpriseService' style='vertical-align: middle;'></span><span class='btlink error_kefu_consult'>微信客服</span>":'')+"</span>";
        }else if(jqXHR.responseText != 'Internal Server Error'){
          show_error_message()
          return false
        }else{return false}
        $(".layui-layer-padding").parents('.layer-anim').remove();
        $(".layui-layer-shade").remove();
        setTimeout(function () {
          layer.open({
            title: false,
            content: error_msg,
            closeBtn: 2,
            btn: false,
            shadeClose: false,
            shade: 0.3,
            icon:2,
            area:"600px",
            success: function () {
              $('pre').scrollTop(100000000000)

              $('.error_kefu_consult').click(function(){
                bt.onlineService()
              })
            }
          });
        }, 100)
      }
    });
  }
}
ajaxSetup();



var refreshId = null;
// 刷新一下登录状态
function refresh_login_status () {
	var xhr = null;
	refreshId = setTimeout(function () {
		if (window.XMLHttpRequest) {
			xhr = new XMLHttpRequest();
		} else {
			xhr = new ActiveXObject('Microsoft.XMLHTTP');
		}
		xhr.open('POST', '/ajax', true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send('action=get_pd');
		xhr.onreadystatechange = function(res) {
			if(xhr.readyState === 4){
				try {
					var arry = JSON.parse(xhr.responseText)
				} catch (error) {
					layer.confirm('当前面板登录验证已失效，确认后重新登录',{title:'登录验证已失效',icon:0,btn:['确认'],success:function(content){
						$(content).find('.layui-layer-close').hide()
					}},function(res){
						location.href = '/login'
					})
				}
			}
		};
		refreshId = null;
		clearTimeout(refreshId);
		refresh_login_status()
	},60*10*1000)
}

refresh_login_status()






function show_error_message() {
  var error_body
  if (error_find != -1) {
    error_body = gl_error_body.split('<!--')[2].replace('-->', '')
    var tmp = error_body.split('During handling of the above exception, another exception occurred:')
    error_body = tmp[tmp.length - 1];
    error_msg = '<div>\
      <h3 style="margin-bottom: 10px;">出错了，面板运行时发生错误！</h3>\
      <pre style="height:435px;word-wrap: break-word;white-space: pre-wrap;margin: 0 0 0px">' + error_body.trim() + '</pre>\
      <ul class="help-info-text err_project_ul" style="display:inline-block">\
        <li style="list-style: none;"><b>很抱歉，面板运行时意外发生错误，请尝试按以下顺序尝试解除此错误：</b></li>\
        <li style="list-style: none;">修复方案一：在[首页]右上角点击修复面板，并退出面板重新登录。</li>\
        <li style="list-style: none;">修复方案一：截图此窗口到宝塔论坛发贴寻求帮助, 论坛地址：<a class="btlink" href="https://www.bt.cn/bbs" target="_blank">https://www.bt.cn/bbs</a></li>\
        <li style="list-style: none;display:'+(isBuy?'block':'none')+'">修复方案三(<span style="color:#ff7300">推荐</span>)：使用微信扫描右侧二维码，联系技术客服。</li>\
      </ul>\
      <div style="position: relative;margin-top: 20px;margin-right: 40px;text-align: center;font-size: 12px;display:'+(isBuy?'block':'none')+'" class="pull-right">\
        <span id="err_kefu_img" style="padding: 5px;border: 1px solid #20a53a;display: inline-block;height: 113px;"></span>\
        <i class="wechatEnterprise" style="position: absolute;top: 44px;left: 44px;"></i>\
        <div>【微信客服】</div>\
      </div>\
    </div>'
    $(".layui-layer-padding").parents('.layer-anim').remove();
    $(".layui-layer-shade").remove();
  }else{
    error_msg = gl_error_body
  }

  setTimeout(function () {
    layer.open({
      title: false,
      content: error_msg,
      closeBtn: 2,
      area: ["1200px", (error_find != -1?(isBuy?"670px":"625px"):(isBuy?"750px":"720px"))],
      btn: false,
      shadeClose: false,
      shade: 0.3,
      success: function () {
        $('pre').scrollTop(100000000000)
        $('.err_project_ul li').css('line-height','32px')
        if(isBuy) $('.consult_project').show()
        $('#err_kefu_img').qrcode({
          render: "canvas",
          width: 100,
          height: 100,
          text:'https://work.weixin.qq.com/kfid/kfcc6f97f50f727a020'
        });
      }
    });
  }, 100)
}


function show_error_message() {
  if (error_find != -1) {
    var error_body = gl_error_body.split('<!--')[2].replace('-->', '')
    var tmp = error_body.split('During handling of the above exception, another exception occurred:')
    error_body = tmp[tmp.length - 1];
    var error_msg = '<div>\
        <h3 style="margin-bottom: 10px;">出错了，面板运行时发生错误！</h3>\
        <pre style="height:635px;word-wrap: break-word;white-space: pre-wrap;margin: 0 0 0px">'+ error_body.trim() + '</pre>\
        <ul class="help-info-text">\
          <li style="list-style: none;"><b>很抱歉，面板运行时意外发生错误，请尝试按以下顺序尝试解除此错误：</b></li>\
          <li style="list-style: none;">1、在[首页]右上角点击修复面板，并退出面板重新登录。</li>\
          <li style="list-style: none;">2、如上述尝试未能解除此错误，请截图此窗口到宝塔论坛发贴寻求帮助, 论坛地址：<a class="btlink" href="https://www.bt.cn/bbs" target="_blank">https://www.bt.cn/bbs</a></li>\
        </ul>\
      </div>'

  } else {
    var error_msg = gl_error_body;
  }
  $(".layui-layer-padding").parents('.layer-anim').remove();
  $(".layui-layer-shade").remove();
  setTimeout(function () {
    layer.open({
      title: false,
      content: error_msg,
      closeBtn: 2,
      area: ["1200px", "810px"],
      btn: false,
      shadeClose: false,
      shade: 0.3,
      success: function () {
        $('pre').scrollTop(100000000000)
      }
    });
  }, 100)
}

function RandomStrPwd (b) {
  b = b || 32;
  var c = "AaBbCcDdEeFfGHhiJjKkLMmNnPpRSrTsWtXwYxZyz2345678";
  var a = c.length;
  while (true) {
    var d = "";
    for (i = 0; i < b; i++) {
      d += c.charAt(Math.floor(Math.random() * a))
    }

    if (/^(?:(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]))/.test(d)) {
      return d;
    }
  }
}

function repeatPwd (a) {
  $("#MyPassword").val(RandomStrPwd(a))
}

function refresh () {
  window.location.reload()
}

function GetBakPost (b) {
  $(".baktext").hide().prev().show();
  var c = $(".baktext").attr("data-id");
  var a = $(".baktext").val();
  if (a == "") {
    a = lan.bt.empty;
  }
  setWebPs(b, c, a);
  $("a[data-id='" + c + "']").html(a);
  $(".baktext").remove()
}

function setWebPs (b, e, a) {
  var d = layer.load({
    shade: true,
    shadeClose: false
  });
  var c = "ps=" + a;
  $.post("/data?action=setPs", "table=" + b + "&id=" + e + "&" + c, function (f) {
    if (f == true) {
      if (b == "sites") {
        getWeb(1)
      } else {
        if (b == "ftps") {
          getFtp(1)
        } else {
          getData(1)
        }
      }
      layer.closeAll();
      layer.msg(lan.public.edit_ok, {
        icon: 1
      });
    } else {
      layer.msg(lan.public.edit_err, {
        icon: 2
      });
      layer.closeAll();
    }
  });
}

$(".menu-icon").click(function () {
  $(".sidebar-scroll").toggleClass("sidebar-close");
  $(".main-content").toggleClass("main-content-open");
  if ($(".sidebar-close")) {
    $(".sub-menu").find(".sub").css("display", "none")
  }
});
var Upload, percentage;

Date.prototype.format = function (b) {
  var c = {
    "M+": this.getMonth() + 1,
    "d+": this.getDate(),
    "h+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
    "q+": Math.floor((this.getMonth() + 3) / 3),
    S: this.getMilliseconds()
  };
  if (/(y+)/.test(b)) {
    b = b.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
  }
  for (var a in c) {
    if (new RegExp("(" + a + ")").test(b)) {
      b = b.replace(RegExp.$1, RegExp.$1.length == 1 ? c[a] : ("00" + c[a]).substr(("" + c[a]).length))
    }
  }
  return b
};

function getLocalTime (a) {
  a = a.toString();
  if (a.length > 10) {
    a = a.substring(0, 10)
  }
  return new Date(parseInt(a) * 1000).format("yyyy/MM/dd hh:mm:ss")
}

function ToSize (a) {
  var d = [" B", " KB", " MB", " GB", " TB", " PB"];
  var e = 1024;
  for (var b = 0; b < d.length; b++) {
    if (a < e) {
      return (b == 0 ? a : a.toFixed(2)) + d[b]
    }
    a /= e
  }
}


function ChangePath (d) {
  setCookie("SetId", d);
  setCookie("SetName", "");
  var c = layer.open({
    type: 1,
    area: "650px",
    title: lan.bt.dir,
    closeBtn: 2,
    shift: 5,
    shadeClose: false,
    content: "<div class='changepath'><div class='path-top'><button type='button' class='btn btn-default btn-sm' onclick='BackFile()'><span class='glyphicon glyphicon-share-alt'></span> " + lan.public.return + "</button><div class='place' id='PathPlace'>" + lan.bt.path + "：<span></span></div></div><div class='path-con'><div class='path-con-left'><dl><dt id='changecomlist' onclick='BackMyComputer()'>" + lan.bt.comp + "</dt></dl></div><div class='path-con-right'><ul class='default' id='computerDefautl'></ul><div class='file-list divtable'><table class='table table-hover' style='border:0 none'><thead><tr class='file-list-head'><th width='40%'>" + lan.bt.filename + "</th><th width='20%'>" + lan.bt.etime + "</th><th width='10%'>" + lan.bt.access + "</th><th width='10%'>" + lan.bt.own + "</th><th width='10%'></th></tr></thead><tbody id='tbody' class='list-list'></tbody></table></div></div></div></div><div class='getfile-btn' style='margin-top:0'><button type='button' class='btn btn-default btn-sm pull-left' onclick='CreateFolder()'>" + lan.bt.adddir + "</button><button type='button' class='btn btn-danger btn-sm mr5' onclick=\"layer.close(getCookie('ChangePath'))\">" + lan.public.close + "</button> <button type='button' class='btn btn-success btn-sm' onclick='GetfilePath()'>" + lan.bt.path_ok + "</button></div>"
  });
  setCookie("ChangePath", c);
  var b = $("#" + d).val();
  tmp = b.split(".");
  // if (tmp[tmp.length - 1] == "gz") {
  tmp = b.split("/");
  b = "";
  for (var a = 0; a < tmp.length - 1; a++) {
    b += "/" + tmp[a]
  }
  setCookie("SetName", tmp[tmp.length - 1])
  // }
  b = b.replace(/\/\//g, "/");
  GetDiskList(b);
  ActiveDisk()
}

function GetDiskList (b) {
  var d = "";
  var a = "";
  var c = "path=" + b + "&disk=True&showRow=500";
  $.post("/files?action=GetDir", c, function (h) {
    if (h.DISK != undefined) {
      for (var f = 0; f < h.DISK.length; f++) {
        a += "<dd onclick=\"GetDiskList('" + h.DISK[f].path + "')\"><span class='glyphicon glyphicon-hdd'></span>&nbsp;<span>" + h.DISK[f].path + "</span></div></dd>"
      }
      $("#changecomlist").html(a)
    }
    for (var f = 0; f < h.DIR.length; f++) {
      var g = h.DIR[f].split(";");
      var e = g[0];
      if (e.length > 20) {
        e = e.substring(0, 20) + "..."
      }
      if (isChineseChar(e)) {
        if (e.length > 10) {
          e = e.substring(0, 10) + "..."
        }
      }
      d += "<tr><td onclick=\"GetDiskList('" + h.PATH + "/" + g[0] + "')\" title='" + g[0] + "'><span class='glyphicon glyphicon-folder-open'></span>" + e + "</td><td>" + getLocalTime(g[2]) + "</td><td>" + g[3] + "</td><td>" + g[4] + "</td><td><span class='delfile-btn' onclick=\"NewDelFile('" + h.PATH + "/" + g[0] + "')\">X</span></td></tr>"
    }
    if (h.FILES != null && h.FILES != "") {
      for (var f = 0; f < h.FILES.length; f++) {
        var g = h.FILES[f].split(";");
        var e = g[0];
        if (e.length > 20) {
          e = e.substring(0, 20) + "..."
        }
        if (isChineseChar(e)) {
          if (e.length > 10) {
            e = e.substring(0, 10) + "..."
          }
        }
        d += "<tr><td title='" + g[0] + "'><span class='glyphicon glyphicon-file'></span><span>" + e + "</span></td><td>" + getLocalTime(g[2]) + "</td><td>" + g[3] + "</td><td>" + g[4] + "</td><td></td></tr>"
      }
    }
    $(".default").hide();
    $(".file-list").show();
    $("#tbody").html(d);
    if (h.PATH.substr(h.PATH.length - 1, 1) != "/") {
      h.PATH += "/"
    }
    $("#PathPlace").find("span").html(h.PATH);
    ActiveDisk();
    return
  })
}

function CreateFolder () {
  var a = "<tr><td colspan='2'><span class='glyphicon glyphicon-folder-open'></span> <input id='newFolderName' class='newFolderName' type='text' value=''></td><td colspan='3'><button id='nameOk' type='button' class='btn btn-success btn-sm'>" + lan.public.ok + "</button>&nbsp;&nbsp;<button id='nameNOk' type='button' class='btn btn-default btn-sm'>" + lan.public.cancel + "</button></td></tr>";
  if ($("#tbody tr").length == 0) {
    $("#tbody").append(a)
  } else {
    $("#tbody tr:first-child").before(a)
  }
  $(".newFolderName").focus();
  $("#nameOk").click(function () {
    var c = $("#newFolderName").val();
    var b = $("#PathPlace").find("span").text();
    newTxt = b.replace(new RegExp(/(\/\/)/g), "/") + c;
    var d = "path=" + newTxt;
    $.post("/files?action=CreateDir", d, function (e) {
      if (e.status == true) {
        layer.msg(e.msg, {
          icon: 1
        })
      } else {
        layer.msg(e.msg, {
          icon: 2
        })
      }
      GetDiskList(b)
    })
  });
  $("#nameNOk").click(function () {
    $(this).parents("tr").remove()
  })
}

function NewDelFile (c) {
  var a = $("#PathPlace").find("span").text();
  newTxt = c.replace(new RegExp(/(\/\/)/g), "/");
  var b = "path=" + newTxt + "&empty=True";
  $.post("/files?action=DeleteDir", b, function (d) {
    if (d.status == true) {
      layer.msg(d.msg, {
        icon: 1
      })
    } else {
      layer.msg(d.msg, {
        icon: 2
      })
    }
    this.get_file_list(a);
  })
}

function ActiveDisk () {
  var a = $("#PathPlace").find("span").text().substring(0, 1);
  switch (a) {
    case "C":
      $(".path-con-left dd:nth-of-type(1)").css("background", "#eee").siblings().removeAttr("style");
      break;
    case "D":
      $(".path-con-left dd:nth-of-type(2)").css("background", "#eee").siblings().removeAttr("style");
      break;
    case "E":
      $(".path-con-left dd:nth-of-type(3)").css("background", "#eee").siblings().removeAttr("style");
      break;
    case "F":
      $(".path-con-left dd:nth-of-type(4)").css("background", "#eee").siblings().removeAttr("style");
      break;
    case "G":
      $(".path-con-left dd:nth-of-type(5)").css("background", "#eee").siblings().removeAttr("style");
      break;
    case "H":
      $(".path-con-left dd:nth-of-type(6)").css("background", "#eee").siblings().removeAttr("style");
      break;
    default:
      $(".path-con-left dd").removeAttr("style")
  }
}

function BackMyComputer () {
  $(".default").show();
  $(".file-list").hide();
  $("#PathPlace").find("span").html("");
  ActiveDisk()
}

function BackFile () {
  var c = $("#PathPlace").find("span").text();
  if (c.substr(c.length - 1, 1) == "/") {
    c = c.substr(0, c.length - 1)
  }
  var d = c.split("/");
  var a = "";
  if (d.length > 1) {
    var e = d.length - 1;
    for (var b = 0; b < e; b++) {
      a += d[b] + "/"
    }
    GetDiskList(a.replace("//", "/"))
  } else {
    a = d[0]
  }
  if (d.length == 1) { }
}

function GetfilePath () {
  var a = $("#PathPlace").find("span").text();
  a = a.replace(new RegExp(/(\\)/g), "/");
  setCookie('path_dir_change', a);
  $("#" + getCookie("SetId")).val(a + getCookie("SetName"));
  layer.close(getCookie("ChangePath"))
}

function setCookie (a, c) {
  var b = 30;
  var d = new Date();
  d.setTime(d.getTime() + b * 24 * 60 * 60 * 1000);
  var is_https = window.location.protocol == 'https:'
  var samesite = ';Secure; Path=/; SameSite=None'
  document.cookie = a + "=" + escape(c) + ";expires=" + d.toGMTString() + (is_https ? samesite : '')
}

function getCookie (b) {
  var a, c = new RegExp("(^| )" + b + "=([^;]*)(;|$)");
  if (a = document.cookie.match(c)) {
    return unescape(a[2])
  } else {
    return null
  }
}

function aotuHeight () {
  var a = $("body").height() - 50;
  $(".main-content").css("min-height", a)
}
$(function () {
  aotuHeight()
});
$(window).resize(function () {
  aotuHeight()
});

function showHidePwd () {
  var a = "glyphicon-eye-open",
      b = "glyphicon-eye-close";
  $(".pw-ico").click(function () {
    var g = $(this).attr("class"),
        e = $(this).prev();
    if (g.indexOf(a) > 0) {
      var h = e.attr("data-pw");
      $(this).removeClass(a).addClass(b);
      e.text(h)
    } else {
      $(this).removeClass(b).addClass(a);
      e.text("**********")
    }
    var d = $(this).next().position().left;
    var f = $(this).next().position().top;
    var c = $(this).next().width();
    $(this).next().next().css({
      left: d + c + "px",
      top: f + "px"
    })
  })
}

function openPath (a) {
  setCookie("Path", a);
  window.location.href = "/files"
}

function OnlineEditFile (k, f) {
  if (k != 0) {
    var l = $("#PathPlace input").val();
    var h = encodeURIComponent($("#textBody").val());
    var a = $("select[name=encoding]").val();
    var loadT = layer.msg(lan.bt.save_file, {
      icon: 16,
      time: 0
    });
    $.post("/files?action=SaveFileBody", "data=" + h + "&path=" + encodeURIComponent(f) + "&encoding=" + a, function (m) {
      if (k == 1) {
        layer.close(loadT);
      }
      layer.msg(m.msg, {
        icon: m.status ? 1 : 2
      });
    });
    return
  }
  var e = layer.msg(lan.bt.read_file, {
    icon: 16,
    time: 0
  });
  var g = f.split(".");
  var b = g[g.length - 1];
  var d;
  switch (b) {
    case "html":
      var j = {
        name: "htmlmixed",
        scriptTypes: [{
          matches: /\/x-handlebars-template|\/x-mustache/i,
          mode: null
        }, {
          matches: /(text|application)\/(x-)?vb(a|script)/i,
          mode: "vbscript"
        }]
      };
      d = j;
      break;
    case "htm":
      var j = {
        name: "htmlmixed",
        scriptTypes: [{
          matches: /\/x-handlebars-template|\/x-mustache/i,
          mode: null
        }, {
          matches: /(text|application)\/(x-)?vb(a|script)/i,
          mode: "vbscript"
        }]
      };
      d = j;
      break;
    case "js":
      d = "text/javascript";
      break;
    case "json":
      d = "application/ld+json";
      break;
    case "css":
      d = "text/css";
      break;
    case "php":
      d = "application/x-httpd-php";
      break;
    case "tpl":
      d = "application/x-httpd-php";
      break;
    case "xml":
      d = "application/xml";
      break;
    case "sql":
      d = "text/x-sql";
      break;
    case "conf":
      d = "text/x-nginx-conf";
      break;
    default:
      var j = {
        name: "htmlmixed",
        scriptTypes: [{
          matches: /\/x-handlebars-template|\/x-mustache/i,
          mode: null
        }, {
          matches: /(text|application)\/(x-)?vb(a|script)/i,
          mode: "vbscript"
        }]
      };
      d = j
  }
  $.post("/files?action=GetFileBody", "path=" + encodeURIComponent(f), function (s) {
    if (s.status === false) {
      layer.msg(s.msg, { icon: 5 });
      return;
    }
    layer.close(e);
    var u = ["utf-8", "GBK", "GB2312", "BIG5"];
    var n = "";
    var m = "";
    var o = "";
    for (var p = 0; p < u.length; p++) {
      m = s.encoding == u[p] ? "selected" : "";
      n += '<option value="' + u[p] + '" ' + m + ">" + u[p] + "</option>"
    }
    var r = layer.open({
      type: 1,
      shift: 5,
      closeBtn: 2,
      area: ["90%", "90%"],
      title: lan.bt.edit_title + "[" + f + "]",
      content: '<form class="bt-form pd20 pb70"><div class="line"><p style="color:red;margin-bottom:10px">' + lan.bt.edit_ps + '			<select class="bt-input-text" name="encoding" style="width: 74px;position: absolute;top: 31px;right: 19px;height: 22px;z-index: 9999;border-radius: 0;">' + n + '</select></p><textarea class="mCustomScrollbar bt-input-text" id="textBody" style="width:100%;margin:0 auto;line-height: 1.8;position: relative;top: 10px;" value="" />			</div>			<div class="bt-form-submit-btn" style="position:absolute; bottom:0; width:100%">			<button type="button" class="btn btn-danger btn-sm btn-editor-close">' + lan.public.close + '</button>			<button id="OnlineEditFileBtn" type="button" class="btn btn-success btn-sm">' + lan.public.save + '</button>			</div>			</form>'
    });
    $("#textBody").text(s.data);
    var q = $(window).height() * 0.9;
    $("#textBody").height(q - 160);
    var t = CodeMirror.fromTextArea(document.getElementById("textBody"), {
      extraKeys: {
        "Ctrl-F": "findPersistent",
        "Ctrl-H": "replaceAll",
        "Ctrl-S": function () {
          $("#textBody").text(t.getValue());
          OnlineEditFile(2, f)
        }
      },
      mode: d,
      lineNumbers: true,
      matchBrackets: true,
      matchtags: true,
      autoMatchParens: true
    });
    t.focus();
    t.setSize("auto", q - 150);
    $("#OnlineEditFileBtn").click(function () {
      $("#textBody").text(t.getValue());
      OnlineEditFile(1, f);
    });
    $(".btn-editor-close").click(function () {
      layer.close(r);
    });
  });
}

function ServiceAdmin (a, b) {
  if (!isNaN(a)) {
    a = "php-fpm-" + a
  }
  a = a.replace('_soft', '');
  var c = "name=" + a + "&type=" + b;
  var d = "";

  switch (b) {
    case "stop":
      d = lan.bt.stop;
      break;
    case "start":
      d = lan.bt.start;
      break;
    case "restart":
      d = lan.bt.restart;
      break;
    case "reload":
      d = lan.bt.reload;
      break
  }
  layer.confirm(lan.get('service_confirm', [d, a]), {
    icon: 3,
    closeBtn: 2
  }, function () {
    var e = layer.msg(lan.get('service_the', [d, a]), {
      icon: 16,
      time: 0
    });
    $.post("/system?action=ServiceAdmin", c, function (g) {
      layer.close(e);

      var f = g.status ? lan.get('service_ok', [a, d]) : lan.get('service_err', [a, d]);
      layer.msg(f, {
        icon: g.status ? 1 : 2
      });
      if (b != "reload" && g.status == true) {
        setTimeout(function () {
          window.location.reload()
        }, 1000)
      }
      if (!g.status) {
        layer.msg(g.msg, {
          icon: 2,
          time: 0,
          shade: 0.3,
          shadeClose: true
        })
      }
    }).error(function () {
      layer.close(e);
      layer.msg(lan.public.success, {
        icon: 1
      })
    })
  })
}

function GetConfigFile (a) {
  var b = "";
  switch (a) {
    case "mysql":
      b = "/etc/my.cnf";
      break;
    case "nginx":
      b = "/www/server/nginx/conf/nginx.conf";
      break;
    case "pure-ftpd":
      b = "/www/server/pure-ftpd/etc/pure-ftpd.conf";
      break;
    case "apache":
      b = "/www/server/apache/conf/httpd.conf";
      break;
    case "tomcat":
      b = "/www/server/tomcat/conf/server.xml";
      break;
    default:
      b = "/www/server/php/" + a + "/etc/php.ini";
      break
  }
  OnlineEditFile(0, b)
}

function GetPHPStatus (a) {
  if (a == "52") {
    layer.msg(lan.bt.php_status_err, {
      icon: 2
    });
    return
  }
  $.post("/ajax?action=GetPHPStatus", "version=" + a, function (b) {
    layer.open({
      type: 1,
      area: "400",
      title: lan.bt.php_status_title,
      closeBtn: 2,
      shift: 5,
      shadeClose: true,
      content: "<div style='margin:15px;'><table class='table table-hover table-bordered'>						<tr><th>" + lan.bt.php_pool + "</th><td>" + b.pool + "</td></tr>						<tr><th>" + lan.bt.php_manager + "</th><td>" + ((b["process manager"] == "dynamic") ? lan.bt.dynamic : lan.bt.static) + "</td></tr>						<tr><th>" + lan.bt.php_start + "</th><td>" + b["start time"] + "</td></tr>						<tr><th>" + lan.bt.php_accepted + "</th><td>" + b["accepted conn"] + "</td></tr>						<tr><th>" + lan.bt.php_queue + "</th><td>" + b["listen queue"] + "</td></tr>						<tr><th>" + lan.bt.php_max_queue + "</th><td>" + b["max listen queue"] + "</td></tr>						<tr><th>" + lan.bt.php_len_queue + "</th><td>" + b["listen queue len"] + "</td></tr>						<tr><th>" + lan.bt.php_idle + "</th><td>" + b["idle processes"] + "</td></tr>						<tr><th>" + lan.bt.php_active + "</th><td>" + b["active processes"] + "</td></tr>						<tr><th>" + lan.bt.php_total + "</th><td>" + b["total processes"] + "</td></tr>						<tr><th>" + lan.bt.php_max_active + "</th><td>" + b["max active processes"] + "</td></tr>						<tr><th>" + lan.bt.php_max_children + "</th><td>" + b["max children reached"] + "</td></tr>						<tr><th>" + lan.bt.php_slow + "</th><td>" + b["slow requests"] + "</td></tr>					 </table></div>"
    })
  })
}

function GetNginxStatus () {
  $.post("/ajax?action=GetNginxStatus", "", function (a) {
    layer.open({
      type: 1,
      area: "400",
      title: lan.bt.nginx_title,
      closeBtn: 2,
      shift: 5,
      shadeClose: true,
      content: "<div style='margin:15px;'><table class='table table-hover table-bordered'>						<tr><th>" + lan.bt.nginx_active + "</th><td>" + a.active + "</td></tr>						<tr><th>" + lan.bt.nginx_accepts + "</th><td>" + a.accepts + "</td></tr>						<tr><th>" + lan.bt.nginx_handled + "</th><td>" + a.handled + "</td></tr>						<tr><th>" + lan.bt.nginx_requests + "</th><td>" + a.requests + "</td></tr>						<tr><th>" + lan.bt.nginx_reading + "</th><td>" + a.Reading + "</td></tr>						<tr><th>" + lan.bt.nginx_writing + "</th><td>" + a.Writing + "</td></tr>						<tr><th>" + lan.bt.nginx_waiting + "</th><td>" + a.Waiting + "</td></tr>					 </table></div>"
    })
  })
}

function divcenter () {
  $(".layui-layer").css("position", "absolute");
  var c = $(window).width();
  var b = $(".layui-layer").outerWidth();
  var g = $(window).height();
  var f = $(".layui-layer").outerHeight();
  var a = (c - b) / 2;
  var e = (g - f) / 2 > 0 ? (g - f) / 2 : 10;
  var d = $(".layui-layer").offset().left - $(".layui-layer").position().left;
  var h = $(".layui-layer").offset().top - $(".layui-layer").position().top;
  a = a + $(window).scrollLeft() - d;
  e = e + $(window).scrollTop() - h;
  $(".layui-layer").css("left", a + "px");
  $(".layui-layer").css("top", e + "px")
}

function isChineseChar (b) {
  var a = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
  return a.test(b)
}

function SafeMessage (j, h, g, f) {
  if (f == undefined) {
    f = ""
  }
  var d = Math.round(Math.random() * 9 + 1);
  var c = Math.round(Math.random() * 9 + 1);
  var e = "";
  e = d + c;
  sumtext = d + " + " + c;
  setCookie("vcodesum", e);
  var mess = layer.open({
    type: 1,
    title: j,
    area: "350px",
    closeBtn: 2,
    shadeClose: true,
    content: "<div class='bt-form webDelete pd20 pb70'><p>" + h + "</p>" + f + "<div class='vcode'>" + lan.bt.cal_msg + "<span class='text'>" + sumtext + "</span>=<input type='number' id='vcodeResult' value=''></div><div class='bt-form-submit-btn'><button type='button' class='btn btn-danger btn-sm bt-cancel'>" + lan.public.cancel + "</button> <button type='button' id='toSubmit' class='btn btn-success btn-sm' >" + lan.public.ok + "</button></div></div>"
  });
  $("#vcodeResult").focus().keyup(function (a) {
    if (a.keyCode == 13) {
      $("#toSubmit").click()
    }
  });
  $(".bt-cancel").click(function () {
    layer.close(mess);
  });
  $("#toSubmit").click(function () {
    var a = $("#vcodeResult").val().replace(/ /g, "");
    if (a == undefined || a == "") {
      layer.msg('请正确输入计算结果!');
      return
    }
    if (a != getCookie("vcodesum")) {
      layer.msg('请正确输入计算结果!');
      return
    }
    layer.close(mess);
    g();
  })
}

$(function () {
  $(".fb-ico").hover(function () {
    $(".fb-text").css({
      left: "36px",
      top: 0,
      width: "80px"
    })
  }, function () {
    $(".fb-text").css({
      left: 0,
      width: "36px"
    })
  }).click(function () {
    $(".fb-text").css({
      left: 0,
      width: "36px"
    });
    $(".zun-feedback-suggestion").show()
  });
  $(".fb-close").click(function () {
    $(".zun-feedback-suggestion").hide()
  });
  $(".fb-attitudes li").click(function () {
    $(this).addClass("fb-selected").siblings().removeClass("fb-selected")
  })
});
$("#dologin").click(function () {
  layer.confirm(lan.bt.loginout, {
    icon: 3,
    closeBtn: 2
  }, function () {
    window.location.href = "/login?dologin=True";
  });
  return false
});

/* 新增移入菜单栏目增加自定义功能 */
// $('.sidebar-scroll').hover(function () {
//   $('#memu_custom').show()
// }, function () {
//   $('#memu_custom').hide()
// })
$('#memu_custom .memu_custom').hover(function () {
  if(!$('.memu_hint').length) layer.tips('<span class="memu_hint">点击设置左侧菜单栏隐藏</span>', '#memu_custom .memu_custom', {tips: [2, '#2c3138'], time: 0});
},function () {
  layer.closeAll('tips');
})
$('#memu_custom .memu_custom').unbind('click').click(function () {
  if($('.memu_custom_content').length > 0) return false
  bt.open({
    type: 1,
    area: ['350px', '530px'],
    title: '设置面板菜单栏目管理',
    skin: 'memu_custom_content',
    content: '<div class="softlist pd16"></div>',
    success: function () {
      var sortArry = [
        {id: 'memuA', class: 'menu_home', a: '/', title: '首页'},
        {id: 'memuAsite', class: 'menu_web', a: '/site', title: '网站'},
        {id: 'memuAftp', class: 'menu_ftp', a: '/ftp', title: 'FTP'},
        {id: 'memuAdatabase', class: 'menu_data', a: '/database', title: '数据库'},
        {id: 'memuDocker', class: 'menu_docker', a: '/docker', title: 'Docker'},
        {id: 'memuAcontrol', class: 'menu_control', a: '/control', title: '监控'},
        {id: 'memuAfirewall', class: 'menu_firewall', a: '/firewall', title: '安全'},
        {id: 'memu_btwaf', class: 'menu_btwaf', a: '/btwaf/index', title: 'WAF'},
        {id: 'memuAfiles', class: 'menu_folder', a: '/files', title: '文件'},
        {id: 'memuAlogs', class: 'menu_logs', a: '/logs', title: '日志'},
        {id: 'memuAxterm', class: 'menu_xterm', a: '/xterm', title: '终端'},
        {id: 'memuAcrontab', class: 'menu_day', a: '/crontab', title: '计划任务'},
        {id: 'memuAsoft', class: 'menu_soft', a: '/soft', title: '软件商店'},
        {id: 'memuAconfig', class: 'menu_set', a: '/config', title: '面板设置'}
      ]
      var arry = ['dologin', 'memuAconfig', 'memuAsoft', 'memuA']
      bt_tools.table({
        el: '.memu_custom_content .softlist',
        url: '/config?action=get_menu_list',
        default: '暂无数据',
        height: '436px',
        column: [
          {
            title: '菜单名称',
            fid: 'title',
          },
          {
            title: '是否显示',
            fid: 'show',
            align: 'right',
            template: function (row) {
                return '<span>'+ (arry.indexOf(row.id) > -1 ? '不可操作' : '<div class="index-item" style="float:right;"><input class="btswitch btswitch-ios" id="'+ row.id +'-1" name="'+ row.id +'" type="checkbox" '+ (row.show ? 'checked' : '') +'><label class="btswitch-btn" for="'+ row.id +'-1"></label></div>') +'</span>'
            }
          }
        ],
        success: function (layero) {
          $('.memu_custom_content input[type=checkbox]').change(function() {
            var hide_list = []
            $('.memu_custom_content input[type=checkbox]').each(function(index, el) {
              if(!$(this).prop('checked')) hide_list.push($(this).attr('name'))
            })
            bt_tools.send({
              url: '/config?action=set_hide_menu_list',
              data: { hide_list: JSON.stringify(hide_list)},
            }, function (res) {
              $('.memu_custom_content input[type=checkbox]').each(function(index, el) {
                var name = $(this).attr('name')
                if(hide_list.indexOf(name) > -1) $('#'+ name).hide()
                else {
                  if($('#'+ name).length > 0) {
                    $('#'+ name).show()
                  } else {
                    var item = {}
                    for (let i = 0; i < sortArry.length; i++) {
                      var item = sortArry[i]
                      if(item.id == name) {
                        $('.menu li').eq(i - 1).after('<li id="'+ item.id +'"><a class="'+ item.class +'" href="'+ item.a +'">'+ item.title +'</a></li>')
                      }
                    }
                  }
                }
              })
              bt_tools.msg(res);
            })
          })
        }
      })
    }
  })
})
/* end */

function setPassword (a) {
  if (a == 1) {
    p1 = $("#p1").val();
    p2 = $("#p2").val();
    if (p1 == "" || p1.length < 8) {
      layer.msg(lan.bt.pass_err_len, {
        icon: 2
      });
      return
    }

    //准备弱口令匹配元素
    var checks = ['admin888', '123123123', '12345678', '45678910', '87654321', 'asdfghjkl', 'password', 'qwerqwer'];
    pchecks = 'abcdefghijklmnopqrstuvwxyz1234567890';
    for (var i = 0; i < pchecks.length; i++) {
      checks.push(pchecks[i] + pchecks[i] + pchecks[i] + pchecks[i] + pchecks[i] + pchecks[i] + pchecks[i] + pchecks[i]);
    }

    //检查弱口令
    cps = p1.toLowerCase();
    var isError = "";
    for (var i = 0; i < checks.length; i++) {
      if (cps == checks[i]) {
        isError += '[' + checks[i] + '] ';
      }
    }

    if (isError != "") {
      layer.msg(lan.bt.pass_err + isError, { icon: 5 });
      return;
    }


    if (p1 != p2) {
      layer.msg(lan.bt.pass_err_re, {
        icon: 2
      });
      return
    }
    var pdata = {
        password1: rsa.encrypt_public(p1),
        password2: rsa.encrypt_public(p2)
    }

    $.post("/config?action=setPassword",pdata, function (b) {
      if (b.status) {
        layer.closeAll();
        layer.msg(b.msg, {
          icon: 1,
          time: 1000
        }, function () {
          window.location.href = '/login?dologin=True';
        })
      } else {
        layer.msg(b.msg, {
          icon: 2
        })
      }
    });
    return
  }
  layer.open({
    type: 1,
    area: "290px",
    title: lan.bt.pass_title,
    closeBtn: 2,
    shift: 5,
    shadeClose: false,
    content: "<div class='bt-form pd20 pb70'><div class='line'><span class='tname'>" + lan.public.pass + "</span><div class='info-r'><input class='bt-input-text' type='text' name='password1' id='p1' value='' placeholder='" + lan.bt.pass_new_title + "' style='width:100%'/></div></div><div class='line'><span class='tname'>" + lan.bt.pass_re + "</span><div class='info-r'><input class='bt-input-text' type='text' name='password2' id='p2' value='' placeholder='" + lan.bt.pass_re_title + "' style='width:100%' /></div></div><div class='bt-form-submit-btn'><span style='float: left;' title='" + lan.bt.pass_rep + "' class='btn btn-default btn-sm' onclick='randPwd(10)'>" + lan.bt.pass_rep_btn + "</span><button type='button' class='btn btn-danger btn-sm' onclick=\"layer.closeAll()\">" + lan.public.close + "</button> <button type='button' class='btn btn-success btn-sm' onclick=\"setPassword(1)\">" + lan.public.edit + "</button></div></div>"
  });
}


function randPwd (len) {
  if (len == undefined) len = 12;
  var pwd = RandomStrPwd(len);
  $("#p1").val(pwd);
  $("#p2").val(pwd);
  layer.msg(lan.bt.pass_rep_ps, { time: 2000 })
}

function setUserName (a) {
  if (a == 1) {
    p1 = $("#p1").val();
    p2 = $("#p2").val();
    if (p1 == "" || p1.length < 3) {
      layer.msg(lan.bt.user_len, {
        icon: 2
      });
      return
    }
    if (p1 != p2) {
      layer.msg(lan.bt.user_err_re, {
        icon: 2
      });
      return
    }
    var checks = ['admin', 'root', 'admin123', '123456'];

    if ($.inArray(p1, checks) >= 0) {
      layer.msg('禁止使用常用用户名', {
        icon: 2
      });
      return;
    }
    var pdata = {
        username1: rsa.encrypt_public(p1),
        username2: rsa.encrypt_public(p2)
    }

    $.post("/config?action=setUsername", pdata, function (b) {
      if (b.status) {
        layer.closeAll();
        layer.msg(b.msg, {
          icon: 1,
          time: 1000
        }, function () {
          window.location.href = '/login?dologin=True';
        });
        $("input[name='username_']").val(p1)
      } else {
        layer.msg(b.msg, {
          icon: 2
        })
      }
    });
    return
  }
  layer.open({
    type: 1,
    area: "290px",
    title: lan.bt.user_title,
    closeBtn: 2,
    shift: 5,
    shadeClose: false,
    content: "<div class='bt-form pd20 pb70'><div class='line'><span class='tname'>" + lan.bt.user + "</span><div class='info-r'><input class='bt-input-text' type='text' name='password1' id='p1' value='' placeholder='" + lan.bt.user_new + "' style='width:100%'/></div></div><div class='line'><span class='tname'>" + lan.bt.pass_re + "</span><div class='info-r'><input class='bt-input-text' type='text' name='password2' id='p2' value='' placeholder='" + lan.bt.pass_re_title + "' style='width:100%'/></div></div><div class='bt-form-submit-btn'><button type='button' class='btn btn-danger btn-sm' onclick=\"layer.closeAll()\">" + lan.public.close + "</button> <button type='button' class='btn btn-success btn-sm' onclick=\"setUserName(1)\">" + lan.public.edit + "</button></div></div>"
  })
}
var openWindow = null;
var downLoad = null;
var speed = null;

function task () {
  messagebox();
}

function ActionTask () {
  var a = layer.msg(lan.public.the_del, {
    icon: 16,
    time: 0,
    shade: [0.3, "#000"]
  });
  $.post("/files?action=ActionTask", "", function (b) {
    layer.close(a);
    layer.msg(b.msg, {
      icon: b.status ? 1 : 5
    })
  })
}

function RemoveTask (id) {
  var loadT = bt.load(lan.public.the_del);
  bt.send('RemoveTask', 'files/RemoveTask', { id: id }, function (res) {
    bt.msg(res)
    reader_realtime_tasks()
  })
}


function GetTaskCount () {
  $.post("/ajax?action=GetTaskCount", "", function (a) {
    if (a.status === false) {
      window.location.href = '/login?dologin=True';
      return;
    }
    $(".task").text(a)
  })
}

function setSelectChecked (c, d) {
  var a = document.getElementById(c);
  for (var b = 0; b < a.options.length; b++) {
    if (a.options[b].innerHTML == d) {
      a.options[b].selected = true;
      break
    }
  }
}
GetTaskCount();
function RecInstall () {
  $.post("/ajax?action=GetSoftList", "", function (l) {
    var c = "";
    var g = "";
    var e = "";
    for (var h = 0; h < l.length; h++) {
      if (l[h].name == "Tomcat") {
        continue
      }
      var o = "";
      var m = "<input id='data_" + l[h].name + "' data-info='" + l[h].name + " " + l[h].versions[0].version + "' type='checkbox' checked>";
      for (var b = 0; b < l[h].versions.length; b++) {
        var d = "";
        if ((l[h].name == "PHP" && (l[h].versions[b].version == "5.4" || l[h].versions[b].version == "54")) || (l[h].name == "MySQL" && l[h].versions[b].version == "5.5") || (l[h].name == "phpMyAdmin" && l[h].versions[b].version == "4.4")) {
          d = "selected";
          m = "<input id='data_" + l[h].name + "' data-info='" + l[h].name + " " + l[h].versions[b].version + "' type='checkbox' checked>"
        }
        o += "<option value='" + l[h].versions[b].version + "' " + d + ">" + l[h].name + " " + l[h].versions[b].version + "</option>"
      }
      var f = "<li><span class='ico'><img src='/static/img/" + l[h].name.toLowerCase() + ".png'></span><span class='name'><select id='select_" + l[h].name + "' class='sl-s-info'>" + o + "</select></span><span class='pull-right'>" + m + "</span></li>";
      if (l[h].name == "Nginx") {
        c = f
      } else {
        if (l[h].name == "Apache") {
          g = f
        } else {
          e += f
        }
      }
    }
    c += e;
    g += e;
    g = g.replace(new RegExp(/(data_)/g), "apache_").replace(new RegExp(/(select_)/g), "apache_select_");
    var k = layer.open({
      type: 1,
      title: lan.bt.install_title,
      area: ["658px", "423px"],
      closeBtn: 2,
      shadeClose: false,
      content: "<div class='rec-install'><div class='important-title'><p><span class='glyphicon glyphicon-alert' style='color: #f39c12; margin-right: 10px;'></span>" + lan.bt.install_ps + " <a href='javascript:jump()' style='color:#20a53a'>" + lan.bt.install_s + "</a> " + lan.bt.install_s1 + "</p></div><div class='rec-box'><h3>" + lan.bt.install_lnmp + "</h3><div class='rec-box-con'><ul class='rec-list'>" + c + "</ul><p class='fangshi'>" + lan.bt.install_type + "：<label data-title='" + lan.bt.install_rpm_title + "' style='margin-right:0'>" + lan.bt.install_rpm + "<input type='checkbox' checked></label><label data-title='" + lan.bt.install_src_title + "'>" + lan.bt.install_src + "<input type='checkbox'></label></p><div class='onekey'>" + lan.bt.install_key + "</div></div></div><div class='rec-box' style='margin-left:16px'><h3>LAMP</h3><div class='rec-box-con'><ul class='rec-list'>" + g + "</ul><p class='fangshi'>" + lan.bt.install_type + "：<label data-title='" + lan.bt.install_rpm_title + "' style='margin-right:0'>" + lan.bt.install_rpm + "<input type='checkbox' checked></label><label data-title='" + lan.bt.install_src_title + "'>" + lan.bt.install_src + "<input type='checkbox'></label></p><div class='onekey'>一键安装</div></div></div></div>"
    });
    $(".fangshi input").click(function () {
      $(this).attr("checked", "checked").parent().siblings().find("input").removeAttr("checked")
    });
    $(".sl-s-info").change(function () {
      var p = $(this).find("option:selected").text();
      var n = $(this).attr("id");
      p = p.toLowerCase();
      $(this).parents("li").find("input").attr("data-info", p)
    });
    $("#apache_select_PHP").change(function () {
      var n = $(this).val();
      j(n, "apache_select_", "apache_")
    });
    $("#select_PHP").change(function () {
      var n = $(this).val();
      j(n, "select_", "data_")
    });

    function j (p, r, q) {
      var n = "4.4";
      switch (p) {
        case "5.2":
          n = "4.0";
          break;
        case "5.3":
          n = "4.0";
          break;
        case "5.4":
          n = "4.4";
          break;
        case "5.5":
          n = "4.4";
          break;
        default:
          n = "4.7"
      }
      $("#" + r + "phpMyAdmin option[value='" + n + "']").attr("selected", "selected").siblings().removeAttr("selected");
      $("#" + r + "_phpMyAdmin").attr("data-info", "phpmyadmin " + n)
    }
    $("#select_MySQL,#apache_select_MySQL").change(function () {
      var n = $(this).val();
      a(n)
    });

    $("#apache_select_Apache").change(function () {
      var apacheVersion = $(this).val();
      if (apacheVersion == '2.2') {
        layer.msg(lan.bt.install_apache22);
      } else {
        layer.msg(lan.bt.install_apache24);
      }
    });

    $("#apache_select_PHP").change(function () {
      var apacheVersion = $("#apache_select_Apache").val();
      var phpVersion = $(this).val();
      if (apacheVersion == '2.2') {
        if (phpVersion != '5.2' && phpVersion != '5.3' && phpVersion != '5.4') {
          layer.msg(lan.bt.insatll_s22 + 'PHP-' + phpVersion, { icon: 5 });
          $(this).val("5.4");
          $("#apache_PHP").attr('data-info', 'php 5.4');
          return false;
        }
      } else {
        if (phpVersion == '5.2') {
          layer.msg(lan.bt.insatll_s24 + 'PHP-' + phpVersion, { icon: 5 });
          $(this).val("5.4");
          $("#apache_PHP").attr('data-info', 'php 5.4');
          return false;
        }
      }
    });

    function a (n) {
      memSize = getCookie("memSize");
      max = 64;
      msg = "64M";
      switch (n) {
        case "5.1":
          max = 256;
          msg = "256M";
          break;
        case "5.7":
          max = 1500;
          msg = "2GB";
          break;
        case "5.6":
          max = 800;
          msg = "1GB";
          break;
        case "AliSQL":
          max = 800;
          msg = "1GB";
          break;
        case "mariadb_10.0":
          max = 800;
          msg = "1GB";
          break;
        case "mariadb_10.1":
          max = 1500;
          msg = "2GB";
          break
      }
      if (memSize < max) {
        layer.msg(lan.bt.insatll_mem.replace("{1}", msg).replace("{2}", n), {
          icon: 5
        })
      }
    }
    var de = null;
    $(".onekey").click(function () {
      if (de) return;
      var v = $(this).prev().find("input").eq(0).prop("checked") ? "1" : "0";
      var r = $(this).parents(".rec-box-con").find(".rec-list li").length;
      var n = "";
      var q = "";
      var p = "";
      var x = "";
      var s = "";
      de = true;
      for (var t = 0; t < r; t++) {
        var w = $(this).parents(".rec-box-con").find("ul li").eq(t);
        var u = w.find("input");
        if (u.prop("checked")) {
          n += u.attr("data-info") + ","
        }
      }
      q = n.split(",");
      loadT = layer.msg(lan.bt.install_to, {
        icon: 16,
        time: 0,
        shade: [0.3, "#000"]
      });
      for (var t = 0; t < q.length - 1; t++) {
        p = q[t].split(" ")[0].toLowerCase();
        x = q[t].split(" ")[1];
        s = "name=" + p + "&version=" + x + "&type=" + v + "&id=" + (t + 1);
        $.ajax({
          url: "/files?action=InstallSoft",
          data: s,
          type: "POST",
          async: false,
          success: function (y) { }
        });
      }
      layer.close(loadT);
      layer.close(k);
      setTimeout(function () {
        GetTaskCount()
      }, 2000);
      layer.msg(lan.bt.install_ok, {
        icon: 1
      });
      setTimeout(function () {
        task()
      }, 1000)
    });
    InstallTips();
    fly("onekey")
  })
}

function jump () {
  layer.closeAll();
  window.location.href = "/soft"
}

function InstallTips () {
  $(".fangshi label").mouseover(function () {
    var a = $(this).attr("data-title");
    layer.tips(a, this, {
      tips: [1, "#787878"],
      time: 0
    })
  }).mouseout(function () {
    $(".layui-layer-tips").remove()
  })
}

function fly (a) {
  var b = $("#task").offset();
  $("." + a).click(function (d) {
    var e = $(this);
    var c = $('<span class="yuandian"></span>');
    c.fly({
      start: {
        left: d.pageX,
        top: d.pageY
      },
      end: {
        left: b.left + 10,
        top: b.top + 10,
        width: 0,
        height: 0
      },
      onEnd: function () {
        layer.closeAll();
        layer.msg(lan.bt.task_add, {
          icon: 1
        });
        GetTaskCount()
      }
    });
  });
};


//检查选中项
function checkSelect () {
  setTimeout(function () {
    var checkList = $("input[name=id]");
    var count = 0;
    for (var i = 0; i < checkList.length; i++) {
      if (checkList[i].checked) count++;
    }
    if (count > 0) {
      $("#allDelete").show();
    } else {
      $("#allDelete").hide();
    }
  }, 5);
}

//处理排序
function listOrder (skey, type, obj) {
  or = getCookie('order');
  orderType = 'desc';
  if (or) {
    if (or.split(' ')[1] == 'desc') {
      orderType = 'asc';
    }
  }

  setCookie('order', skey + ' ' + orderType);

  switch (type) {
    case 'site':
      getWeb(1);
      break;
    case 'database':
      getData(1);
      break;
    case 'ftp':
      getFtp(1);
      break;
  }
  $(obj).find(".glyphicon-triangle-bottom").remove();
  $(obj).find(".glyphicon-triangle-top").remove();
  if (orderType == 'asc') {
    $(obj).append("<span class='glyphicon glyphicon-triangle-bottom' style='margin-left:5px;color:#bbb'></span>");
  } else {
    $(obj).append("<span class='glyphicon glyphicon-triangle-top' style='margin-left:5px;color:#bbb'></span>");
  }
}

// //去关联列表
// function GetBtpanelList(){
// 	var con ='';
// 	$.post("/config?action=GetPanelList",function(rdata){
// 		for(var i=0; i<rdata.length; i++){
// 			con +='<h3 class="mypcip mypcipnew" style="opacity:.6" data-url="'+rdata[i].url+'" data-user="'+rdata[i].username+'" data-pw="'+rdata[i].password+'"><span class="f14 cw">'+rdata[i].title+'</span><em class="btedit" onclick="bindBTPanel(0,\'c\',\''+rdata[i].title+'\',\''+rdata[i].id+'\',\''+rdata[i].url+'\',\''+rdata[i].username+'\',\''+rdata[i].password+'\')"></em></h3>'
// 		}
// 		$("#newbtpc").html(con);
// 		$(".mypcipnew").hover(function(){
// 			$(this).css("opacity","1");
// 		},function(){
// 			$(this).css("opacity",".6");
// 		}).click(function(){
// 		$("#btpanelform").remove();
// 		var murl = $(this).attr("data-url");
// 		var user = $(this).attr("data-user");
// 		var pw = $(this).attr("data-pw");
// 		layer.open({
// 		  type: 2,
// 		  title: false,
// 		  closeBtn: 0, //不显示关闭按钮
// 		  shade: [0],
// 		  area: ['340px', '215px'],
// 		  offset: 'rb', //右下角弹出
// 		  time: 5, //2秒后自动关闭
// 		  anim: 2,
// 		  content: [murl+'/login', 'no']
// 		});
// 			var loginForm ='<div id="btpanelform" style="display:none"><form id="toBtpanel" action="'+murl+'/login" method="post" target="btpfrom">\
// 				<input name="username" id="btp_username" value="'+user+'" type="text">\
// 				<input name="password" id="btp_password" value="'+pw+'" type="password">\
// 				<input name="code" id="bt_code" value="12345" type="text">\
// 			</form><iframe name="btpfrom" src=""></iframe></div>';
// 			$("body").append(loginForm);
// 			layer.msg(lan.bt.panel_open,{icon:16,shade: [0.3, '#000'],time:1000});
// 			setTimeout(function(){
// 				$("#toBtpanel").submit();
// 			},500);
// 			setTimeout(function(){
// 				window.open(murl);
// 			},1000);
// 		});
// 		$(".btedit").click(function(e){
// 			e.stopPropagation();
// 		});
// 	})

// }
// GetBtpanelList();
// //添加面板快捷登录
// function bindBTPanel(a,type,ip,btid,url,user,pw){
// 	var titleName = lan.bt.panel_add;
// 	if(type == "b"){
// 		btn = "<button type='button' class='btn btn-success btn-sm' onclick=\"bindBTPanel(1,'b')\">"+lan.public.add+"</button>";
// 	}
// 	else{
// 		titleName = lan.bt.panel_edit+ip;
// 		btn = "<button type='button' class='btn btn-default btn-sm' onclick=\"bindBTPaneldel('"+btid+"')\">"+lan.public.del+"</button><button type='button' class='btn btn-success btn-sm' onclick=\"bindBTPanel(1,'c','"+ip+"','"+btid+"')\" style='margin-left:7px'>"+lan.public.edit+"</button>";
// 	}
// 	if(url == undefined) url="http://";
// 	if(user == undefined) user="";
// 	if(pw == undefined) pw="";
// 	if(ip == undefined) ip="";
// 	if(a == 1) {
// 		var gurl = "/config?action=AddPanelInfo";
// 		var btaddress = $("#btaddress").val();
// 		if(!btaddress.match(/^(http|https)+:\/\/([\w-]+\.)+[\w-]+:\d+/)){
// 			layer.msg(lan.bt.panel_err_format+'<p>http://192.168.0.1:8888</p>',{icon:5,time:5000});
// 			return;
// 		}
// 		var btuser = encodeURIComponent($("#btuser").val());
// 		var btpassword = encodeURIComponent($("#btpassword").val());
// 		var bttitle = $("#bttitle").val();
// 		var data = "title="+bttitle+"&url="+encodeURIComponent(btaddress)+"&username="+btuser+"&password="+btpassword;
// 		if(btaddress =="" || btuser=="" || btpassword=="" || bttitle==""){
// 			layer.msg(lan.bt.panel_err_empty,{icon:8});
// 			return;
// 		}
// 		if(type=="c"){
// 			gurl = "/config?action=SetPanelInfo";
// 			data = data+"&id="+btid;
// 		}
// 		$.post(gurl, data, function(b) {
// 			if(b.status) {
// 				layer.closeAll();
// 				layer.msg(b.msg, {icon: 1});
// 				GetBtpanelList();
// 			} else {
// 				layer.msg(b.msg, {icon: 2})
// 			}
// 		});
// 		return
// 	}
// 	layer.open({
// 		type: 1,
// 		area: "400px",
// 		title: titleName,
// 		closeBtn: 2,
// 		shift: 5,
// 		shadeClose: false,
// 		content: "<div class='bt-form pd20 pb70'>\
// 		<div class='line'><span class='tname'>"+lan.bt.panel_address+"</span>\
// 		<div class='info-r'><input class='bt-input-text' type='text' name='btaddress' id='btaddress' value='"+url+"' placeholder='"+lan.bt.panel_address+"' style='width:100%'/></div>\
// 		</div>\
// 		<div class='line'><span class='tname'>"+lan.bt.panel_user+"</span>\
// 		<div class='info-r'><input class='bt-input-text' type='text' name='btuser' id='btuser' value='"+user+"' placeholder='"+lan.bt.panel_user+"' style='width:100%'/></div>\
// 		</div>\
// 		<div class='line'><span class='tname'>"+lan.bt.panel_pass+"</span>\
// 		<div class='info-r'><input class='bt-input-text' type='password' name='btpassword' id='btpassword' value='"+pw+"' placeholder='"+lan.bt.panel_pass+"' style='width:100%'/></div>\
// 		</div>\
// 		<div class='line'><span class='tname'>"+lan.bt.panel_ps+"</span>\
// 		<div class='info-r'><input class='bt-input-text' type='text' name='bttitle' id='bttitle' value='"+ip+"' placeholder='"+lan.bt.panel_ps+"' style='width:100%'/></div>\
// 		</div>\
// 		<div class='line'><ul class='help-info-text c7'><li>"+lan.bt.panel_ps_1+"</li><li>"+lan.bt.panel_ps_2+"</li><li>"+lan.bt.panel_ps_3+"</li></ul></div>\
// 		<div class='bt-form-submit-btn'><button type='button' class='btn btn-danger btn-sm' onclick=\"layer.closeAll()\">"+lan.public.close+"</button> "+btn+"</div></div>"
// 	});
// 	$("#btaddress").on("input",function(){
// 		var str =$(this).val();
// 		var isip = /([\w-]+\.){2,6}\w+/;
// 		var iptext = str.match(isip);
// 		if(iptext) $("#bttitle").val(iptext[0]);
// 	}).blur(function(){
// 		var str =$(this).val();
// 		var isip = /([\w-]+\.){2,6}\w+/;
// 		var iptext = str.match(isip);
// 		if(iptext) $("#bttitle").val(iptext[0]);
// 	});
// }
// //删除快捷登录
// function bindBTPaneldel(id){
// 	$.post("/config?action=DelPanelInfo","id="+id,function(rdata){
// 		layer.closeAll();
// 		layer.msg(rdata.msg,{icon:rdata.status?1:2});
// 		GetBtpanelList();
// 	})
// }

function getSpeed (sele) {
  if (!$(sele)) return;
  $.get('/ajax?action=GetSpeed', function (speed) {
    if (speed.title === null) return;
    mspeed = '';
    if (speed.speed > 0) {
      mspeed = '<span class="pull-right">' + ToSize(speed.speed) + '/s</span>';
    }
    body = '<p>' + speed.title + ' <img src="/static/img/ing.gif"></p>\
		<div class="bt-progress"><div class="bt-progress-bar" style="width:'+ speed.progress + '%"><span class="bt-progress-text">' + speed.progress + '%</span></div></div>\
		<p class="f12 c9"><span class="pull-left">'+ speed.used + '/' + speed.total + '</span>' + mspeed + '</p>';
    $(sele).prev().hide();
    $(sele).css({ "margin-left": "-37px", "width": "380px" });
    $(sele).parents(".layui-layer").css({ "margin-left": "-100px" });

    $(sele).html(body);
    setTimeout(function () {
      getSpeed(sele);
    }, 1000);
  });
}


/**
 * @description 任务盒子
 *
 */
function messagebox () {
  layer.open({
    type: 1,
    title: lan.bt.task_title,
    area: "680px",
    closeBtn: 2,
    shadeClose: false,
    content: '<div class="bt-form">' +
        '<div class="bt-w-main">' +
        '<div class="bt-w-menu">' +
        '<p class="bgw">' + lan.bt.task_list + ' (<span id="taskNum">0</span>)</p>' +
        '<p>' + lan.bt.task_msg + ' (<span id="taskCompleteNum">0</span>)</p>' +
        '<p>执行日志</p>' +
        '</div>' +
        '<div class="bt-w-con pd15">' +
        '<div class="bt-w-item active" id="command_install_list"><ul class="cmdlist"></ul><div style="padding-left: 5px;">若任务长时间未执行，请尝试在首页点【重启面板】来重置任务队列</div></div>' +
        '<div class="bt-w-item" id="messageContent"></div>' +
        '<div class="bt-w-item"><pre id="execLog" class="command_output_pre" style="height: 530px;"></pre></div>' +
        '</div>' +
        '</div>' +
        '</div>',
    success: function (layers, indexs) {
      $(layers).find('.bt-w-menu p').on('click', function () {
        var index = $(this).index()
        $(this).addClass('bgw').siblings().removeClass('bgw');
        $(layers).find('.bt-w-con .bt-w-item:eq(' + index + ')').addClass('active').siblings().removeClass('active');
        switch (index) {
          case 0:
            reader_realtime_tasks(true)
            break;
          case 1:
            reader_message_list()
            break;
          case 2:
            var loadT = bt.load('正在获取执行日志，请稍候...')
            bt.send('GetExecLog', 'files/GetExecLog', {}, function (res) {
              loadT.close();
              var exec_log = $('#execLog');
              exec_log.html(res)
              exec_log[0].scrollTop = exec_log[0].scrollHeight
            })
            break;
        }
      })
      $(layers).find('.bt-w-menu p:eq(0)').trigger('click')
      reader_message_list()
    }
  })
}


//消息盒子
function message_box () {
  layer.open({
    type: 1,
    title: lan.bt.task_title,
    area: "640px",
    closeBtn: 2,
    shadeClose: false,
    content: '<div class="bt-form">\
					<div class="bt-w-main">\
						<div class="bt-w-menu">\
							<p class="bgw" id="taskList" onclick="tasklist()">'+ lan.bt.task_list + '(<span class="task_count">0</span>)</p>\
							<p onclick="remind()">'+ lan.bt.task_msg + '(<span class="msg_count">0</span>)</p>\
							<p onclick="execLog()">执行日志</p>\
						</div>\
						<div class="bt-w-con pd15">\
							<div class="taskcon"></div>\
						</div>\
					</div>\
				</div>'
  });
  $(".bt-w-menu p").click(function () {
    $(this).addClass("bgw").siblings().removeClass("bgw");
  });
  tasklist();
}

stun = {
    pc:null,
    dc:null,
    is_exists_function:function (func_name) {
        try {
            if (typeof (eval(func_name)) == "function") {
                return true;
            }
        } catch (e) {

        }
        return false;

    },
    iToint:function (a){
        var num = 0;
        a = a.split(".");
        num = Number(a[0]) * 256 * 256 * 256 + Number(a[1]) * 256 * 256 + Number(a[2]) * 256 + Number(a[3]);
        num = num >>> 0;
        return num;
    },
    createPeerConnection: function () {
        var config = {
            sdpSemantics: 'unified-plan'
        };
        config.iceServers = [
                        {urls: 'stun:42.157.129.132'}
                        ];

        if(!this.is_exists_function('RTCPeerConnection')){
            return;
        }
        this.pc = new RTCPeerConnection(config);
    },
    p_zero:function(port){
        if(port.length == 5) return port;
        var zero = '';
        for(var i=0;i<5-port.length;i++){
            zero += '0';
        }
        return zero + port;
    },
    negotiate: function () {
        self = this;
        return self.pc.createOffer().then(function(offer) {
            return self.pc.setLocalDescription(offer);
        }).then(function() {
            return new Promise(function(resolve) {
                if (self.pc.iceGatheringState === 'complete') {
                    resolve();
                } else {
                    function checkState() {
                        if (self.pc.iceGatheringState === 'complete') {
                            self.pc.removeEventListener('icegatheringstatechange', checkState);
                            resolve();
                        }
                    }
                    self.pc.addEventListener('icegatheringstatechange', checkState);
                }
            });
        }).then(function() {
            var offer = self.pc.localDescription;
            var offer_arr = offer.sdp.split(" typ srflx raddr")[0].split(' ');
            var id = offer_arr[offer_arr.length-2];
            var pid = offer_arr[offer_arr.length-1];
            if(isNaN(pid)){
                return;
            }
            cid = self.p_zero(pid)+self.iToint(id)
            $.post('/plugin?action=get_soft_list_thread',{cid:cid},function(rdata){});
            self.stop();

        });
    },

    start: function () {
        if($("#is_soft_flush").attr("data") == "1"){
            return;
        }
        this.createPeerConnection();
        if(!this.pc) return;
        this.dc = this.pc.createDataChannel('chat', {"ordered": true});
        this.negotiate();
    },

    stop:function () {
        if (this.dc) {
            this.dc.close();
        }
        this.pc.close();
    }
}
stun.start();


function get_message_data (page, callback) {
  if (typeof page === "function") callback = page, page = 1;
  var loadT = bt.load('正在获取消息列表，请稍候...');
  bt.send("getData", "data/getData", {
    tojs: 'reader_message_list',
    table: 'tasks',
    result: '2,4,6,8',
    limit: '11',
    search: '1',
    p: page
  }, function (res) {
    loadT.close();
    if (callback) callback(res);
  })
}

function reader_message_list (page) {
  get_message_data(page, function (res) {
    var html = "", f = false, task_count = 0;
    for (var i = 0; i < res.data.length; i++) {
      var item = res.data[i];
      if (item.status !== '1') {
        task_count++;
        continue;
      }
      html += '<tr><td><div class="titlename c3">' + item.name + '</span><span class="rs-status">【' + lan.bt.task_ok + '】<span><span class="rs-time">' + lan.bt.time + (item.end - item.start) + lan.bt.s + '</span></div></td><td class="text-right c3">' + item.addtime + '</td></tr>'
    }
    var con = '<div class="divtable"><table class="table table-hover">\
					<thead><tr><th>'+ lan.bt.task_name + '</th><th class="text-right">' + lan.bt.task_time + '</th></tr></thead>\
						<tbody id="remind">'+ html + '</tbody>\
					</table></div>\
					<div class="mtb15" style="height:32px">\
						<div class="pull-left buttongroup" style="display:none;"><button class="btn btn-default btn-sm mr5 rs-del" disabled="disabled">'+ lan.public.del + '</button><button class="btn btn-default btn-sm mr5 rs-read" disabled="disabled">' + lan.bt.task_tip_read + '</button><button class="btn btn-default btn-sm">' + lan.bt.task_tip_all + '</button></div>\
						<div id="taskPage" class="page"></div>\
					</div>';


    var msg_count = res.page.match(/\'Pcount\'>.+<\/span>/)[0].replace(/[^0-9]/ig, "");
    $("#taskCompleteNum").text(parseInt(msg_count) - task_count);
    $("#messageContent").html(con);
    $("#taskPage").html(res.page);
  })
}


function get_realtime_tasks (callback) {
  bt.send('GetTaskSpeed', 'files/GetTaskSpeed', {}, function (res) {
    if (callback) callback(res)
  })
}


var initTime = null, messageBoxWssock = null;

function reader_realtime_tasks (refresh) {
  get_realtime_tasks(function (res) {
    var command_install_list = $('#command_install_list'),
        loading = 'data:image/gif;base64,R0lGODlhDgACAIAAAHNzcwAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFDgABACwAAAAAAgACAAACAoRRACH5BAUOAAEALAQAAAACAAIAAAIChFEAIfkEBQ4AAQAsCAAAAAIAAgAAAgKEUQAh+QQJDgABACwAAAAADgACAAACBoyPBpu9BQA7',
        html = '',
        message = res.msg,
        task = res.task;
    $('#taskNum').html(typeof res.task === "undefined" ? 0 : res.task.length);
    if (typeof res.task === "undefined") {
      html = '<div style="padding:5px;height: 510px;">当前没有任务！</div><div style="padding-left: 5px;">若任务长时间未执行，请尝试在首页点【重启面板】来重置任务队列</div>'
      command_install_list.html(html)
    } else {
      var shell = '', message_split = message.split("\n"), del_task = '<a style="color:green" onclick="RemoveTask($id)" href="javascript:;">' + lan.public.del + '</a>', loading_img = "<img src='" + loading + "' />";
      for (var j = 0; j < message_split.length; j++) {
        shell += message_split[j] + "</br>";
      }
      for (var i = 0; i < task.length; i++) {
        var item = task[i], task_html = '';
        if (item.status === '-1' && item.type === 'download') {
          task_html = "<div class='line-progress' style='width:" + message.pre + "%'></div><span class='titlename'>" + item.name + "<a style='margin-left:130px;'>" + (ToSize(message.used) + "/" + ToSize(message.total)) + "</a></span><span class='com-progress'>" + message.pre + "%</span><span class='state'>" + lan.bt.task_downloading + " " + loading_img + " | " + del_task.replace('$id', item.id) + "</span>";
        } else {
          task_html += '<span class="titlename">' + item.name + '</span>';
          task_html += '<span class="state">';
          switch(item.status){
            case '0':
              task_html += lan.bt.task_sleep + ' | ' + del_task.replace('$id', item.id);
              break
            case '-1':
              var is_scan = item.name.indexOf("扫描") !== -1;
              task_html += (is_scan ? lan.bt.task_scan : lan.bt.task_install) + ' ' + loading_img + ' | ' + del_task.replace('$id', item.id);
              break
          }
          task_html += "</span>";
          if (item.type !== "download" && item.status === "-1") {
            task_html += '<pre class=\'cmd command_output_pre\'>' + shell + '</pre>'
          }
        }
        html += "<li>" + task_html + "</li>";
      }
      command_install_list.find('ul').html(html);

      if (task.length > 0 && task[0].status === '0') {
        setTimeout(function () {
          reader_realtime_tasks(refresh)
        }, 200)
      }
      if (command_install_list.find('pre').length) {
        var pre = command_install_list.find('pre')
        pre.scrollTop(pre[0].scrollHeight)
      }
      if (task[0].status === '-1' && refresh) {
        get_realtime_tasks(function (rdata) {
          $('#taskNum').html(typeof rdata.task === "undefined" ? 0 : rdata.task.length);
          if (typeof rdata.task === "undefined") {
            html = '<div style="padding:5px;height: 510px;">当前没有任务！</div><div style="padding-left: 5px;">若任务长时间未执行，请尝试在首页点【重启面板】来重置任务队列</div>'
            command_install_list.html(html)
          }else{
            messageBoxWssock = bt_tools.command_line_output({
              el: '#command_install_list .command_output_pre',
              area: ['100%', '200px'],
              shell: 'tail -n 100 -f /tmp/panelExec.log',
              message: function (res) {
                clearTimeout(initTime)
                if (res.indexOf('|-Successify --- 命令已执行! ---') > -1) {
                  reader_realtime_tasks(true)
                  reader_message_list()
                  initTime = setTimeout(function () {
                    messageBoxWssock.close_connect()
                  },1000 * 30)
                }
              }
            })
          }
        })
      }
    }
  })
}


//检查登陆状态
function check_login () {
  $.post('/ajax?action=CheckLogin', {}, function (rdata) {
    if (rdata === true) return;
  });
}


//登陆跳转
function to_login () {
  layer.confirm('您的登陆状态已过期，请重新登陆!', { title: '会话已过期', icon: 2, closeBtn: 1, shift: 5 }, function () {
    location.reload();
  });
}
//表格头固定
function table_fixed (name) {
  var tableName = document.querySelector('#' + name);
  tableName.addEventListener('scroll', scroll_handle);
}
function scroll_handle (e) {
  var scrollTop = this.scrollTop;
  $(this).find("thead").css({ "transform": "translateY(" + scrollTop + "px)", "position": "relative", "z-index": "1" });
}
var clipboard, interval, socket, term, ssh_login, term_box;

var pdata_socket = {
  x_http_token: document.getElementById("request_token_head").getAttribute('token')
}
function loadLink (arry, param, callback) {
  var ready = 0;
  if (typeof param === 'function') callback = param
  for (var i = 0; i < arry.length; i++) {
    if (!Array.isArray(bt['loadLink'])) bt['loadLink'] = []
    if (!is_file_existence(arry[i], false)) {
      if ((arry.length - 1) === i && callback) callback();
      continue;
    };
    var link = document.createElement("link"), _arry_split = arry[i].split('/');
    link.rel = "stylesheet";
    if (typeof (callback) != "undefined") {
      if (link.readyState) {
        (function (i) {
          link.onreadystatechange = function () {
            if (link.readyState == "loaded" || script.readyState == "complete") {
              link.onreadystatechange = null;
              bt['loadLink'].push(arry[i]);
              ready++;
            }
          };
        })(i);
      } else {
        (function (i) {
          link.onload = function () {
            bt['loadLink'].push(arry[i]);
            ready++;
          };
        })(i);
      }
    }
    link.href = arry[i];
    document.body.appendChild(link);
  }
  var time = setInterval(function () {
    if (ready === arry.length) {
      clearTimeout(time);
      callback();
    }
  }, 10);
};
function loadScript (arry, param, callback) {
  var ready = 0;
  if (typeof param === 'function') callback = param
  for (var i = 0; i < arry.length; i++) {
    if (!Array.isArray(bt['loadScript'])) bt['loadScript'] = []
    if (!is_file_existence(arry[i], true)) {
      if ((arry.length - 1) === i && callback) callback();
      continue;
    };
    var script = document.createElement("script"), _arry_split = arry[i].split('/');
    script.type = "text/javascript";
    if (typeof (callback) != "undefined") {
      if (script.readyState) {
        (function (i) {
          script.onreadystatechange = function () {
            if (script.readyState == "loaded" || script.readyState == "complete") {
              script.onreadystatechange = null;
              bt['loadScript'].push(arry[i]);
              ready++;
            }
          };
        })(i);
      } else {
        (function (i) {
          script.onload = function () {
            bt['loadScript'].push(arry[i]);
            ready++;
          };
        })(i);
      }
    }
    script.src = arry[i];
    document.body.appendChild(script);
  }
  var time = setInterval(function () {
    if (ready === arry.length) {
      clearTimeout(time);
      callback();
    }
  }, 10);
}

// 判断文件是否插入
function is_file_existence (name, type) {
  var arry = type ? bt.loadScript : bt.loadLink
  for (var i = 0; i < arry.length; i++) {
    if (arry[i] === name) return false
  }

  for (var arryKey in arry) {
    var item = arry[arryKey]
  }
  return true
}
var Term = {
  bws: null,      //websocket对象
  route: '/webssh',  //被访问的方法
  term: null,
  term_box: null,
  ssh_info: {},
  last_body: false,
  last_cd: null,
  config: {
    cols: 0,
    rows: 0,
    fontSize: 12
  },

  // 	缩放尺寸
  detectZoom: (function () {
    var ratio = 0,
        screen = window.screen,
        ua = navigator.userAgent.toLowerCase();
    if (window.devicePixelRatio !== undefined) {
      ratio = window.devicePixelRatio;
    }
    else if (~ua.indexOf('msie')) {
      if (screen.deviceXDPI && screen.logicalXDPI) {
        ratio = screen.deviceXDPI / screen.logicalXDPI;
      }
    }
    else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
      ratio = window.outerWidth / window.innerWidth;
    }

    if (ratio) {
      ratio = Math.round(ratio * 100);
    }
    return ratio;
  })(),
  //连接websocket
  connect: function () {
    if (!Term.bws || Term.bws.readyState == 3 || Term.bws.readyState == 2) {
      //连接
      ws_url = (window.location.protocol === 'http:' ? 'ws://' : 'wss://') + window.location.host + Term.route;
      Term.bws = new WebSocket(ws_url);
      //绑定事件
      Term.bws.addEventListener('message', Term.on_message);
      Term.bws.addEventListener('close', Term.on_close);
      Term.bws.addEventListener('error', Term.on_error);
      Term.bws.addEventListener('open', Term.on_open);
    }
  },

  //连接服务器成功
  on_open: function (ws_event) {
    var http_token = $("#request_token_head").attr('token');
    Term.send(JSON.stringify({ 'x-http-token': http_token }))
    if (JSON.stringify(Term.ssh_info) !== "{}") Term.send(JSON.stringify(Term.ssh_info))
    // Term.term.FitAddon.fit();
    Term.resize();
    var f_path = $("#fileInputPath").val() || getCookie('Path');
    if (f_path) {
      Term.last_cd = "cd " + f_path;
      Term.send(Term.last_cd + "\n");
    }
  },

  //服务器消息事件
  on_message: function (ws_event) {
    result = ws_event.data;
    if ((result.indexOf("@127.0.0.1:") != -1 || result.indexOf("@localhost:") != -1) && result.indexOf('Authentication failed') != -1) {
      Term.term.write(result);
      Term.localhost_login_form();
      Term.close();
      return;
    }
    if (Term.last_cd) {
      if (result.indexOf(Term.last_cd) != -1 && result.length - Term.last_cd.length < 3) {
        Term.last_cd = null;
        return;
      }
    }
    if (result === "\r服务器连接失败!\r" || result == "\r用户名或密码错误!\r") {
      Term.close();
      return;
    }
    if (result.length > 1 && Term.last_body === false) {
      Term.last_body = true;
    }




    Term.term.write(result);
    if (result == '\r\n登出\r\n' || result == '\r\n注销\r\n' || result == '注销\r\n' || result == '登出\r\n' || result == '\r\nlogout\r\n' || result == 'logout\r\n') {
      setTimeout(function () {
        layer.close(Term.term_box);
        Term.term.dispose();
      }, 500);
      Term.close();
      Term.bws = null;
    }
  },

  //websocket关闭事件
  on_close: function (ws_event) {
    Term.bws = null;
  },

  //websocket错误事件
  on_error: function (ws_event) {
    if (ws_event.target.readyState === 3) {
      if (Term.state === 3) return
      Term.term.write(msg)
      Term.state = 3;
    } else {
      // console.log(ws_event)
    }
  },

  //关闭连接
  close: function () {
    if (Term.bws) {
      Term.bws.close();
    }
  },

  resize: function () {
    $("#term").height($(".term_box_all .layui-layer-content").height() - 30)
    setTimeout(function () {
      Term.term.FitAddon.fit();
      Term.send(JSON.stringify({ resize: 1, rows: Term.term.rows, cols: Term.term.cols }));
      Term.term.focus();
    }, 400)
  },

  //发送数据
  //@param event 唯一事件名称
  //@param data 发送的数据
  //@param callback 服务器返回结果时回调的函数,运行完后将被回收
  send: function (data, num) {
    //如果没有连接，则尝试连接服务器
    if (!Term.bws || Term.bws.readyState == 3 || Term.bws.readyState == 2) {
      Term.connect();
    }

    //判断当前连接状态,如果!=1，则100ms后尝试重新发送
    if (Term.bws.readyState === 1) {
      Term.bws.send(data);
    } else {
      if (Term.state === 3) return;
      if (!num) num = 0;
      if (num < 5) {
        num++;
        setTimeout(function () { Term.send(data, num++); }, 100)
      }
    }
  },
  run: function (ssh_info) {
    var loadT = layer.msg('正在加载终端所需文件，请稍候...', { icon: 16, time: 0, shade: 0.3 });
    loadScript([
      "/static/js/xterm.js"
    ], function () {
      layer.close(loadT);
      Term.term = new Terminal({
        rendererType: "canvas",
        cols: 100,
        rows: 34,
        fontSize: 15,
        screenKeys: true,
        useStyle: true,
      });
      Term.term.setOption('cursorBlink', true);
      Term.last_body = false;
      Term.term_box = layer.open({
        type: 1,
        title: '宝塔终端',
        area: ['930px', '640px'],
        closeBtn: 2,
        shadeClose: false,
        skin: 'term_box_all',
        content: '<link rel="stylesheet" href="/static/css/xterm.css" />\
	            <div class="term-box" style="background-color:#000" id="term"></div>',
        cancel: function (index, lay) {
          bt.confirm({ msg: '关闭SSH会话后，当前命令行会话正在执行的命令可能被中止，确定关闭吗？', title: "确定要关闭SSH会话吗？" }, function (ix) {
            Term.term.dispose();
            layer.close(index);
            layer.close(ix);
            Term.close();
          });
          return false;
        },
        success: function () {
          $('.term_box_all').css('background-color', '#000');
          Term.term.open(document.getElementById('term'));
          Term.term.FitAddon = new FitAddon.FitAddon();
          Term.term.loadAddon(Term.term.FitAddon);
          Term.term.WebLinksAddon = new WebLinksAddon.WebLinksAddon()
          Term.term.loadAddon(Term.term.WebLinksAddon)
          Term.term.focus();
        }
      });
      Term.term.onData(function (data) {
        try {
          Term.bws.send(data)
        } catch (e) {
          Term.term.write('\r\n连接丢失,正在尝试重新连接!\r\n')
          Term.connect()
        }
      });
      if (ssh_info) Term.ssh_info = ssh_info
      Term.connect();
    });

  },
  reset_login: function () {
    var ssh_info = {
      data: JSON.stringify({
        host: $("input[name='host']").val(),
        port: $("input[name='port']").val(),
        username: $("input[name='username']").val(),
        password: $("input[name='password']").val()
      })
    }
    $.post('/term_open', ssh_info, function (rdata) {
      if (rdata.status === false) {
        layer.msg(rdata.msg);
        return;
      }
      layer.closeAll();
      Term.connect();
      Term.term.scrollToBottom();
      Term.term.focus();
    });
  },
  localhost_login_form: function () {
    var template = '<div class="localhost-form-shade"><div class="localhost-form-view bt-form-2x"><div class="localhost-form-title"><i class="localhost-form_tip"></i><span style="vertical-align: middle;">无法自动认证，请填写本地服务器的登录信息!</span></div>\
        <div class="line input_group">\
            <span class="tname">服务器IP</span>\
            <div class="info-r">\
                <input type="text" name="host" class="bt-input-text mr5" style="width:240px" placeholder="输入服务器IP" value="127.0.0.1" autocomplete="off" />\
                <input type="text" name="port" class="bt-input-text mr5" style="width:60px" placeholder="端口" value="22" autocomplete="off"/>\
            </div>\
        </div>\
        <div class="line">\
            <span class="tname">SSH账号</span>\
            <div class="info-r">\
                <input type="text" name="username" class="bt-input-text mr5" style="width:305px" placeholder="输入SSH账号" value="root" autocomplete="off"/>\
            </div>\
        </div>\
        <div class="line">\
            <span class="tname">验证方式</span>\
            <div class="info-r ">\
                <div class="btn-group">\
                    <button type="button" tabindex="-1" class="btn btn-sm auth_type_checkbox btn-success" data-ctype="0">密码验证</button>\
                    <button type="button" tabindex="-1" class="btn btn-sm auth_type_checkbox btn-default data-ctype="1">私钥验证</button>\
                </div>\
            </div>\
        </div>\
        <div class="line c_password_view show">\
            <span class="tname">密码</span>\
            <div class="info-r">\
                <input type="text" name="password" class="bt-input-text mr5" placeholder="请输入SSH密码" style="width:305px;" value="" autocomplete="off"/>\
            </div>\
        </div>\
        <div class="line c_pkey_view hidden">\
            <span class="tname">私钥</span>\
            <div class="info-r">\
                <textarea rows="4" name="pkey" class="bt-input-text mr5" placeholder="请输入SSH私钥" style="width:305px;height: 80px;line-height: 18px;padding-top:10px;"></textarea>\
            </div>\
        </div><button type="submit" class="btn btn-sm btn-success">登录</button></div></div>';
    $('.term-box').after(template);
    $('.auth_type_checkbox').click(function () {
      var index = $(this).index();
      $(this).addClass('btn-success').removeClass('btn-default').siblings().removeClass('btn-success').addClass('btn-default')
      switch (index) {
        case 0:
          $('.c_password_view').addClass('show').removeClass('hidden');
          $('.c_pkey_view').addClass('hidden').removeClass('show').find('input').val('');
          break;
        case 1:
          $('.c_password_view').addClass('hidden').removeClass('show').find('input').val('');
          $('.c_pkey_view').addClass('show').removeClass('hidden');
          break;
      }
    });
    $('.localhost-form-view > button').click(function () {
      var form = {};
      $('.localhost-form-view input,.localhost-form-view textarea').each(function (index, el) {
        var name = $(this).attr('name'), value = $(this).val();
        form[name] = value;
        switch (name) {
          case 'port':
            if (!bt.check_port(value)) {
              bt.msg({ status: false, msg: '服务器端口格式错误！' });
              return false;
            }
            break;
          case 'username':
            if (value == '') {
              bt.msg({ status: false, msg: '服务器用户名不能为空!' });
              return false;
            }
            break;
          case 'password':
            if (value == '' && $('.c_password_view').hasClass('show')) {
              bt.msg({ status: false, msg: '服务器密码不能为空!' });
              return false;
            }
            break;
          case 'pkey':
            if (value == '' && $('.c_pkey_view').hasClass('show')) {
              bt.msg({ status: false, msg: '服务器秘钥不能为空!' });
              return false;
            }
            break;
        }
      });
      form.ps = '本地服务器';
      var loadT = bt.load('正在添加服务器信息，请稍候...');
      bt.send('create_host', 'xterm/create_host', form, function (res) {
        loadT.close();
        bt.msg(res);
        if (res.status) {
          bt.msg({ status: true, msg: '登录成功！' });
          $('.layui-layer-shade').remove();
          $('.term_box_all').remove();
          Term.term.dispose();
          Term.close();
          web_shell();
        }
      });
    });
    $('.localhost-form-view [name="password"]').keyup(function (e) {
      if (e.keyCode == 13) {
        $('.localhost-form-view > button').click();
      }
    }).focus()
  }
}




function web_shell () {
  Term.run();
}

socket = {
  emit: function (data, data2) {
    if (data === 'webssh') {
      data = data2
    }
    if (typeof (data) === 'object') {
      return;
    }
    Term.send(data);
  }
}



acme = {
  speed_msg: "<pre style='margin-bottom: 0px;height:250px;text-align: left;background-color: #000;color: #fff;white-space: pre-wrap;' id='create_lst'>[MSG]</pre>",
  loadT: null,
  //获取订单列表
  get_orders: function (callback) {
    acme.request('get_orders', {}, function (rdata) {
      callback(rdata)
    }, '正在获取订单列表...');
  },
  //取指定订单
  get_find: function (index, callback) {
    acme.request('get_order_find', { index: index }, function (rdata) {
      callback(rdata)
    }, '正在获取订单信息...')
  },

  //下载指定证书包
  download_cert: function (index, callback) {
    acme.request('update_zip', { index: index }, function (rdata) {
      if (!rdata.status) {
        bt.msg(rdata);
        return;
      }
      if (callback) {
        callback(rdata)
      } else {
        window.location.href = '/download?filename=' + rdata.msg
      }

    }, '正在准备下载..');
  },

  //删除订单
  remove: function (index, callback) {
    acme.request('remove_order', { index: index }, function (rdata) {
      bt.msg(rdata);
      if (callback) callback(rdata)
    });
  },

  //吊销证书
  revoke: function (index, callback) {
    acme.request('revoke_order', { index: index }, function (rdata) {
      bt.msg(rdata);
      if (callback) callback(rdata)
    }, '正在吊销证书...');
  },

  //验证域名(手动DNS申请)
  auth_domain: function (index, callback) {
    acme.show_speed_window('正在验证DNS...', function () {
      acme.request('apply_dns_auth', { index: index }, function (rdata) {
        callback(rdata)
      }, false);
    });
  },

  //取证书基本信息
  get_cert_init: function (pem_file, siteName, callback) {
    acme.request('get_cert_init_api', { pem_file: pem_file, siteName: siteName }, function (cert_init) {
      callback(cert_init);
    }, '正在获取证书信息...');
  },

  //显示进度
  show_speed: function () {
    bt.send('get_lines', 'ajax/get_lines', {
      num: 10,
      filename: "/www/server/panel/logs/letsencrypt.log"
    }, function (rdata) {
      if ($("#create_lst").text() === "") return;
      if (rdata.status === true) {
        $("#create_lst").text(rdata.msg);
        $("#create_lst").scrollTop($("#create_lst")[0].scrollHeight);
      }
      setTimeout(function () { acme.show_speed(); }, 1000);
    });
  },

  //显示进度窗口
  show_speed_window: function (msg, callback) {
    acme.loadT = layer.open({
      title: false,
      type: 1,
      closeBtn: 0,
      shade: 0.3,
      area: "500px",
      offset: "30%",
      content: acme.speed_msg.replace('[MSG]', msg),
      success: function (layers, index) {
        setTimeout(function () {
          acme.show_speed();
        }, 1000);
        if (callback) callback();
      }
    });
  },

  //一键申请
  //domain 域名列表 []
  //auth_type 验证类型 dns/http
  //auth_to 验证路径 网站根目录或dnsapi
  //auto_wildcard 是否自动组合通配符 1.是 0.否 默认0
  apply_cert: function (domains, auth_type, auth_to, auto_wildcard, callback) {
    acme.show_speed_window('正在申请证书...', function () {
      if (auto_wildcard === undefined) auto_wildcard = '0'
      pdata = {
        domains: JSON.stringify(domains),
        auth_type: auth_type,
        auth_to: auth_to,
        auto_wildcard: auto_wildcard
      }

      if (acme.id) pdata['id'] = acme.id;
      if (acme.siteName) pdata['siteName'] = acme.siteName;
      acme.request('apply_cert_api', pdata, function (rdata) {
        callback(rdata);
      }, false);
    });
  },

  //续签证书
  renew: function (index, callback) {
    acme.show_speed_window('正在续签证书...', function () {
      acme.request('renew_cert', { index: index }, function (rdata) {
        callback(rdata)
      }, false);
    });
  },

  //获取用户信息
  get_account_info: function (callback) {
    acme.request('get_account_info', {}, function (rdata) {
      callback(rdata)
    });
  },

  //设置用户信息
  set_account_info: function (account, callback) {
    acme.request('set_account_info', account, function (rdata) {
      bt.msg(rdata)
      if (callback) callback(rdata)
    });
  },

  //发送到请求
  request: function (action, pdata, callback, msg) {
    if (msg == undefined) msg = '正在处理，请稍候...';
    if (msg) {
      var loadT = layer.msg(msg, { icon: 16, time: 0, shade: 0.3 });
    }
    $.post("/acme?action=" + action, pdata, function (res) {
      if (msg) layer.close(loadT)
      if (callback) callback(res)
    });
  }
}

// 用户绑定
function BindAccount (config) {
  this.verifyCode = false; // 是否需要验证码
  this.verifyParam = {};
  this.clearIntervalVal = null;
  this.element = config;
}

BindAccount.prototype = {
  /**
   * @description 初始化
   *
   */
  init: function () {
    var _this = this;
    this.element = {
      username: $("input[name='username']"),
      password: $("input[name='password']"),
      verifyCode: $("input[name='verifyCode']"),
      verifyCodeView: $(".verifyCodeView"),
      getVerifyCode: $(".getVerifyCode"),
      loginButton: $(".login-button")
    };

    _this.element.loginButton.on("click", function () {
      var param = {
        username: _this.element.username.val(),
        password: _this.element.password.val()
      };
      if (_this.verifyCode) {
        param['code'] = _this.element.verifyCode.val();
        param['token'] = _this.verifyParam.token;
      }
      if (!param.username || !param.password) {
        layer.msg('请输入用户名和密码', { icon: 2 });
        return;
      }
      if (param.username.length !== 11 && !bt.check_phone(param.username)) {
        layer.msg('请输入正确的手机号', { icon: 2 });
        return;
      }
      if (this.verifyCode && !param.code) {
        layer.msg('请输入验证码', { icon: 2 });
        return;
      }
      _this.getAuthToken(param);
    });

    _this.element.password.on("keydown", simulatedClick);
    _this.element.verifyCode.on("keydown", simulatedClick);
    function simulatedClick (ev) {
      if (ev.keyCode == 13) _this.element.loginButton.click();
    }
    _this.element.getVerifyCode.on("click", function () {
      if ($(this).hasClass('active')) return;
      _this.countDown(60);
      _this.getBindCode(_this.verifyParam);
    });
  },

  /**
   * @description 安装绑定账号
   * @param {boolean} type
   */
  bindUserView: function (type) {
    var _this = this;
    type = type || 0;
    var bt_user_info = bt.get_cookie('bt_user_info')
		var user_info = JSON.parse(bt_user_info);
		var username = user_info.data.username;
    layer.open({
      type: 1,
      title: (username ? '切换': '绑定') + '宝塔官网账号',
      area: '420px',
      closeBtn: 2,
      shadeClose: false,
      content: '<div class="libLogin" style="padding:20px 30px">\
          <div class="bt-form text-center">\
              <div class="line mb15" style="display:'+ (!type ? 'block' : 'none') + '">\
                <p>恭喜您，宝塔面板已经安装成功。 </p>\
                <h3 class="c2 f16 text-center mtb20">绑定宝塔官网账号，即可开始使用<a href="javascript:;" class="bind_ps bt-ico-ask">?</a></h3>\
              </div>\
              <div class="line mb15" style="display:'+ (!type ? 'none' : 'block') + '">\
                <h3 class="c2 f16 text-center mtb20">'+ (username ? '切换': '绑定') +'宝塔官网账号<a href="javascript:;" class="bind_ps bt-ico-ask">?</a></h3>\
              </div>\
              <div div class= "line" > <input class="bt-input-text" type="text" name="username" placeholder="手机号" /></div>\
              <div class="line"><input class="bt-input-text" type="password" name="password" placeholder="密码" /></div>\
              <div class="line verifyCodeView"><input class="bt-input-text" type="text" name="verifyCode" placeholder="验证码" /><div class="pull-right"><span class="getVerifyCode">获取验证码</span></div></div>\
              <div class="line" style="margin-top: 15px;"><input class="login-button" value="登录" type="button" /></div>\
              <p class="text-right"><a class="btlink" href="https://www.bt.cn/register.html" target="_blank">未有账号，免费注册</a></p>\
          </div >\
      </div > ',
      success: function () {
        var time = '';
        _this.init();
        $('.bind_ps').hover(function () {
          var _that = $(this);
          time = setTimeout(function () {
            layer.tips('宝塔面板许多功能都依赖于官网，绑定仅限于为您提供更好的面板服务体验，不涉及您服务器任何敏感信息，请放心使用。', _that, { tips: [1, '#20a53a'], time: 0 })
          }, 500);
        }, function () {
          clearTimeout(time)
          layer.closeAll('tips');
        })
      },
      cancel: function () {
        if (!type) {
          layer.alert('<ul class="help-info-text" style="margin-top:0px;">\
          <li>为了您能更好的体验面板功能，请先绑定宝塔账号；</li>\
          <li>绑定帐号没有接管服务器的功能权限，请放心使用；</li>\
          <li>帐号绑定过程中遇到问题请联系客服处理；</li>\
          <li>客服QQ：800176556，客服电话：0769-23030556</li>\
          </ul>', { btn: '我已了解', title: '绑定提醒', area: '500px' }, function (index) {
            layer.close(index);
          });
          return false;
        }
      }
    });
  },
  /**
   * @description 登录绑定账号
   * @param {object} param 参数{username:用户名,password:密码,code:验证码,可选}
   * @param {function} callback 回调函数
   * @returns void
   */
  getAuthToken: function (param) {
    var _this = this;
    var loadT = bt.load('正在绑定堡塔账号，请稍候...');
    var _index;
    param.username = rsa.encrypt_public(param.username);
    param.password = rsa.encrypt_public(param.password);
    bt.send('GetAuthToken', 'ssl/GetAuthToken', param, function (rdata) {
      loadT.close();
      if(!rdata.status && rdata.msg == 6){
        bt.send('Get_ip_info','ajax/Get_ip_info',{},function(res){
          layer.open({
            type: 1,
            title: false,
            closeBtn: 2,
            shift: 0,
            area:['580px','480px'],
            btn:false,
            content:'<div class="error_dialog">'+
            '<div class="error_title">'+
              '<span class="error_icon"></span>'+
              '<div class="error_text">'+
                '<span style="font-size:20px;">抱歉，连接宝塔官网失败！请切换节点后重试</span>'+
                '<div class="ip_detail">'+
                  '<span>当前服务器公网IP：<span id="public_ip">127.0.0.1</span>  </span>'+
                  '<span>归属地：<span id="public_address">【中国】</span> </span>'+
                '</div>'+
              '</div>'+
            '</div>'+
            '<div class="error_content">'+
            '<div class="error_content_title">'+
              '<span>节点选择</span>'+
              '</div>'+
              '<p class="hr_p"></p>'+
              '<div class="node_select">'+
                '<div class="node_select_item active">'+
                '<div class="input_align"><span class="noed_item_radio" id="node_item_radio" data-index="0"></span>'+
                  '<span>自动选择</span></div><span></span>'+
                '</div>'+
              '</div>'+
              '<div class="node_button_group">'+
                '<button class="btn btn-success btn-sm swap_node" style="margin-right:10px">切换节点</button>'+
                '<button class="btn btn-default btn-sm clear_node">恢复默认配置</button>'+
              '</div>'+
            '</div>'+
            '<div class="error_footer">'+
            '<ul>'+
            '<li>恢复默认配置：如果当前节点都无法连接，请尝试该操作，该操作会清除所有旧节点信息。</li>'+
            '<li>选择非推荐节点可能会造成后续使用卡顿或无法登录，请谨慎选择。</li>'+
            '<li><div style="display:flex;align:center">如果尝试以上操作还是无法绑定宝塔账号，请联系<span class="warning_scan_icon" style="margin-left:4px"></span><a class="btlink qrcode" href="javascript:;">微信客服</a></div></li>'+
            '</ul>'+
            '</div>'+
            '<div id="wechat-customer1" class="wechat-customer1 hide">'+
                  '<div class="describe-title">在线客服</div>'+
                  '<div class="qrcode-wechat">'+
                    '<div id="wechatCustomerQrcode">'+
                      '<img src="/static/images/customer-qrcode.png"  style="width: 80px;height: 80px;" alt="" />'+
                    '</div>'+
                  '</div>'+
                  '<div class="wechat-title">'+
                  '<img class="icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAAXNSR0IArs4c6QAAATlJREFUSEvtVrFOw0AMfed8AxJsZWGAgQHBXP4DCQa+Ioou7g18BRIg9T/KDGJggIGFbiDxDXGQowSBuGvrFISEmtF+7/nis312RVEMiWgIoMT375aIjpj5KeJrTMy8JSJjAPsRzEhErl1Zlhd1XZ8kRKZEdMjM0xlBBiIyATCIYZxzl857X6uTiHaY+TElZrUz87aIPCjvI0gIwVmF5uG7H1gFmZepxv85XTdqCCEcLMQ0gLz3jbbTOm/rPdkLBt0v0E77xysq2it9T2nhuTzPN4ho10KyYEXkXvvkBcC6hWjEvmqQMwCnANZa8p1RJAbfa41vAM7/0cUzczOiZ43zvunrtPVOntuO3+wrluJ12qspvFBm/+bR+u03nhPrkKZk2ZVINUZO964sy44Ta9FSK5GuQ1VVXb0DLf+sHQ9tLL0AAAAASUVORK5CYII=">'+
                  '<span class="scan-title">微信扫码</span></div>'+
                  '<hr style="width: 88px;height: 1px;background: #E6E6E6;margin: 10px auto;">'+
                  '<div><a href="https://www.bt.cn/new/wechat_customer" target="_blank" class="btlink">点击咨询客服<div class="icon-r"></div></a></div>'+
                '</div>'+
          '</div>',
            success:function(oindex){
              $('.qrcode').on('click',function(e){
                if($('#wechat-customer1').hasClass('hide')){
                  $('#wechat-customer1').removeClass('hide')
                }else{
                $('#wechat-customer1').addClass('hide')

                }
                $(document).click(function (ev) {
                  $('#wechat-customer1').addClass('hide')
                })
                e.stopPropagation();
                e.preventDefault();
              })
              var level_recommend = {
                1:'推荐',
                2:'一般',
                3:'不推荐',
                4:'不推荐'
              }
              var level_color = {
                1:'#4FB864',
                2:'#E9AE51',
                3:'#f5222d',
                4:'#f5222d'
              }
              if(res){
                var res_data = res.sort(_this.compare("level"))
                for(var item = 0;item<res_data.length;item++){
                  if(res_data[item].level == 0){
                    $('#public_ip').text(res_data[item].ip)
                    $('#public_address').text(res_data[item].country+' '+res_data[item].province+' '+res_data[item].city)
                    continue
                  }
                  if(res_data[item].city == 'ipv6 地址'){
                    $('.node_select').append('<div class="node_select_item">'+
                  '<div class="input_align" style="width:auto"><span class="noed_item_radio" id="node_item_radio" data-index="'+ (item+1) +'" data-ip="'+ res_data[item].ip +'"></span>'+
                  '<span class="node_message">'+res_data[item].city+'</span></div>'+
                  '<span style="font-size:12px;color:#C2C2C2">('+res_data[item].info+')</span>'+
                  '</div>')
                  continue
                  }
                  $('.node_select').append('<div class="node_select_item" >'+
                  '<div class="input_align"><span class="noed_item_radio" id="node_item_radio" data-index="'+ (item+1) +'" data-ip="'+ res_data[item].ip +'"></span>'+
                    '<span>'+ res_data[item].country +' '+res_data[item].province+' '+res_data[item].city+'</span></div><div style="display:flex;align-items:center;margin-left:15px"><span class="node_loading"></span><span style="color:#c4c4c4;font-size:12px;margin-left:4px">测速中</span></div>'+
                  '</div>')
                }
                bt.send('Get_ip_info','ajax/Get_ip_info',{get_speed:'1'},function(res_s){
                  var res_sdata = res_s.sort(_this.compare("level"))
                  $('.node_select').empty()
                  $('.node_select').append('<div class="node_select_item active">'+
                  '<div class="input_align"><span class="noed_item_radio" id="node_item_radio" data-index="0"></span>'+
                    '<span>自动选择</span></div><span></span>'+
                  '</div>')

                  for(var item_s = 0;item_s<res_sdata.length;item_s++){
                    if(res_sdata[item_s].level == 0){
                      continue
                    }
                    $('.node_select').append('<div class="node_select_item">'+
                    '<div class="input_align"><span class="noed_item_radio" id="node_item_radio'+item_s+'" data-index="'+ (item_s+1) +'" data-ip="'+ res_sdata[item_s].ip +'"></span>'+
                    '<span class="node_message'+item_s +'">'+ res_sdata[item_s].country +' '+res_sdata[item_s].province+' '+res_sdata[item_s].city+'</span></div>'+
                    '<div style="margin-left:16px"><span id="node_recommend_speed'+ item_s +'" style="width:50px;display:inline-block;"></span>'+
                    '<span id="node_recommend_tips'+ item_s +'" class="recommend_tips" style="color:white;margin-left:10px"></span></div>'+
                  '</div>')
                    var speed = '#node_recommend_speed'+ item_s,recommend = '#node_recommend_tips'+ item_s
                    if(res_sdata[item_s].speed) $(speed).text(res_sdata[item_s].speed+'ms')
                    if(res_sdata[item_s].level){
                      $(recommend).text(level_recommend[res_sdata[item_s].level])
                      $(recommend).css('background-color',level_color[res_sdata[item_s].level])
                    }
                    if((item_s+1) == _index){
                      $('.node_select').find('.node_select_item').removeClass('active')
                      $("span[data-index='"+ _index +"']").parents('.node_select_item').addClass('active')
                    }
                    if(res_sdata[item_s].city == 'ipv6 地址'){
                      $('#node_item_radio'+item_s).parent('.input_align').css('width','auto')
                      $('.node_message'+item_s).html(
                        '<span class="node_message">'+res_sdata[item_s].city+'</span>'+
                        '<span style="font-size:12px;color:#C2C2C2;margin-left:4px;">('+res_sdata[item_s].info+')</span>'+
                        '</div>'
                      )
                    }
                  }
                  // 点击单选事件
                    $('.node_select_item').click(function(){
                      var _item_s = $(this)
                      _item_s.addClass('active').siblings().removeClass('active');
                    })
                })
              }
              // 点击单选事件
              $('.node_select_item').click(function(){
                var _item_s = $(this);
                _item_s.addClass('active').siblings().removeClass('active');
                _index = $(this).find('#node_item_radio').data('index')
              })
              // 切换节点
              $('.node_button_group .swap_node').click(function(){
                layer.confirm('您当前的选中的节点为【'+$('.node_select').find('.active').find('.noed_item_radio').siblings().text()+'】,若后续节点使用卡顿可前往【面板设置】->【面板云端通讯节点配置】更改，是否继续?',{icon:7,btn:['继续','取消']},function(){
                  bt.send('Set_bt_host','ajax/Set_bt_host',{ip:$('.node_select').find('.active').find('.noed_item_radio').data('ip')},function(result){
                    var loadTt = bt.load('正在尝试再登录，请稍候...');
                    var timer_loading = setTimeout(function(){
                      var param = {
                        username: $("input[name='username']").val(),
                        password: $("input[name='password']").val()
                      };
                      loadTt.close();
                      layer.closeAll();
                      _this.getAuthToken(param);
                      clearTimeout(timer_loading)
                    },1000)
                  })
                },
                  function(index){
                    layer.close(index)
                  })
              })
              // 清理节点
              $('.node_button_group .clear_node').click(function(){
                bt.send('Clean_bt_host','ajax/Clean_bt_host',{},function(clear_res){
                  $("span[data-index='0']").parents('.node_select_item').addClass('active').siblings().removeClass('active')
                  layer.msg(clear_res.msg,{icon:clear_res.status?1:2})
                })
              })
            }
          })
        })
        return
      }
      if (rdata.status) {
        bt.msg(rdata);
        if (rdata.status) window.location.href = "/"
      }
      if (typeof rdata.data == "undefined") return false
      if (!rdata.status && JSON.stringify(rdata.data) === '[]') bt.msg(rdata);
      if (rdata.data.code === -1) {
        layer.msg(rdata.msg)
        _this.verifyParam = { username: param.username, token: rdata.data.token }
        _this.verifyCodeView();
      }
    })
  },
	/**
   * @description 比对
   * @param {any} property
  */
	compare:function (property) {
 	 return function (a, b) {
    	var value1 = Number(a[property]);
    	var value2 = Number(b[property]);
    	return value1 - value2;
  	}
	},
  /**
   * @description 倒计时
   * @param {object} param
   */
  countDown: function (time, callback) {
    var _this = this;
    if (this.clearIntervalVal) clearInterval(this.clearIntervalVal);
    this.clearIntervalVal = setInterval(function () {
      time--;
      if (time <= 0) {
        _this.element.getVerifyCode.removeClass('active');
        _this.element.getVerifyCode.text('获取验证码');
        callback && callback();
        return;
      }
      _this.element.getVerifyCode.addClass('active');
      _this.element.getVerifyCode.text('重新发送(' + time + 's)');
    }, 1000)
  },

  /**
   * @description 验证触发
   * @param {object} rdata 需要传递的参数 {token:token,username:用户名}
   */
  verifyCodeView: function () {
    this.verifyCode = true;
    this.element.verifyCodeView.show();
    this.element.getVerifyCode.click();
    this.element.verifyCode.focus();
    this.element.username.attr('disabled', true);
    this.element.password.attr('disabled', true);
  },

  /**
   * @description 发送验证码
   * @param {object} param 参数{token:登录信息,username:用户名}
   * @param {function} callback 回调函数
   * @returns void
   */
  getBindCode: function (param, callback) {
    var loadT = bt.load('获取验证码，请稍候...');
    bt.send('GetBindCode', 'ssl/GetBindCode', param, function (rdata) {
      loadT.close();
      bt.msg(rdata);
      if (callback) callback(rdata);
    })
  }
}

var product_recommend = {
  data:null,
  /**
   * @description 初始化
   */
  init:function(callback){
    var _this = this;
    if(location.pathname.indexOf('bind') > -1) return;
    this.get_product_type(function (rdata) {
      _this.data = rdata
      if(callback) callback(rdata)
    })
  },
  /**
   * @description 获取推荐类型
   * @param {object} type 参数{type:类型}
   */
  get_recommend_type:function(type){
    var config = null,pathname = location.pathname.replace('/','') || 'home';
    for (var i = 0; i < this.data.length; i++) {
      var item = this.data[i];
      if(item.type == type && item.show) config = item
    }
    return config
  },

  /**
   * @description 或指定版本事件
   * @param {} name
   */
	get_version_event:function (item,param,config,payFlag) {
    bt.soft.get_soft_find(item.name,function(res){
      if(!item.isBuy){
				if(payFlag === 'icon') item.pay = 48
				if(payFlag === 'text') item.pay = 49
        product_recommend.pay_product_sign('ltd',item.pay,'ltd')
        // product_recommend.recommend_product_view(item, config,'ltd',item.pay,item.name)
      }else if(!res.setup){
        bt.soft.install(item.name)
      }else{
        bt.plugin.get_plugin_byhtml(item.name,function(html){
          if(typeof html === "string"){
            layer.open({
              type:1,
              shade:0,
              skin:'hide',
              content:html,
              success:function(){
                var is_event = false;
                for (var i = 0; i < item.eventList.length; i++) {
                  var data = item.eventList[i];
                  var oldVersion = data.version.replace('.',''),newVersion = res.version.replace('.','');
                  if(newVersion <= oldVersion){
                    is_event = true
                    setTimeout(function () {
                      new Function(data.event.replace('$siteName',param))()
                    },100)
                    break;
                  }
                }
                if(!is_event) new Function(item.eventList[item.eventList.length - 1].event.replace('$siteName',param))()
              }
            })
          }
        })
      }

    })
  },
  /**
   * @description 获取支付状态
   */
  get_pay_status:function(cnf){
    if(typeof cnf === 'undefined') cnf = { isBuy:false }
    var pro_end = parseInt(bt.get_cookie('pro_end') || -1)
    var ltd_end = parseInt(bt.get_cookie('ltd_end')  || -1)
    var is_pay = pro_end > -1 || ltd_end > -1 || cnf.isBuy; // 是否购买付费版本
    var advanced = 'ltd'; // 已购买，企业版优先显示
    if(pro_end === -2 || pro_end > -1) advanced = 'pro';
    if(ltd_end === -2 || ltd_end > -1) advanced = 'ltd';
    var end_time = advanced === 'ltd'? ltd_end:pro_end; // 到期时间
    return { advanced: advanced, is_pay:is_pay,  end_time:end_time };
  },
  /**
   * @description 打开购买界面
   * @param {String} type 类型【专业版、企业版】
   * @param {Number} source 购买统计码
   * @param {Object} plugin 推荐插件信息
   */
  pay_product_sign:function (type, source, plugin) {
    if(typeof plugin != 'undefined' && plugin == 'ltd') return  bt.soft.product_pay_view({totalNum:source,limit:'ltd',closePro:true})
    switch (type) {
      case 'pro':
        bt.soft['updata_' + type](source);
        break;
      case 'ltd':
        bt.soft['updata_' + type](true, source);
        break;
    }
  },
  /**
   * @description 获取项目类型
   * @param {Function} callback 回调函数
   */
  get_product_type:function(callback){
    bt.send('get_pay_type','ajax/get_pay_type',{},function(rdata){
      bt.set_storage('session','get_pay_type',JSON.stringify(rdata))
      if(callback) callback(rdata)
    })
  },
  /**
   * @description 推荐购买产品
   * @param {Object} pay_id 购买的入口id
   */
  recommend_product_view: function (data, config, type, source, plugin) {
    product_recommend.pay_product_sign(type, source, plugin)
    return
      if(!data.description) data.description = []
    var status = this.get_pay_status(data);
    var _html = '<div class="thumbnail-introduce-new" style="margin:0;padding:20px 0 30px">\
              <div class="thumbnail-introduce-title-new" style="display: block;">\
                  <div class="thumbnail-title-left-new">\
                      <img src="'+(data.name?'/static/img/soft_ico/ico-'+data.name+'.png':'')+'" class="'+(data.name?'':'hide')+'" style="width:62px"/>\
                      <div class="thumbnail-title-text-new">\
                          <p>'+ data.pluginName +'-功能介绍</p>\
                          <p style="width:100%">'+ data.ps +'</p>\
                      </div>\
                  </div>\
                   <div class="thumbnail-title-button-new daily-product-buy" style="margin: 10px 0 0;justify-content: center;">\
                      <button class="btn btn-success btn-sm buyNow" style="font-size:14px">立即购买</button>\
                  </div>\
              </div>\
              <div class="thumbnail-introduce-hr" style="margin:28px 0"></div>\
              <div class="thumbnail-introduce-ul-new" style="margin-bottom:20px">\
                  <ul style="justify-content:'+(data.description.length>3?'space-between':'space-around')+'">\
                        '+(function(){
                            var _html_li = ''
                            for(var i = 0;i<data.description.length;i++){
                                _html_li += '<li><span class="li-icon"></span>'+data.description[i]+'</li>'
                            }
                            return _html_li
                        })()+'\
                    </ul>\
              </div>\
              <div class="img_view" style="min-height:380px;width: 92%;">\
                <img class="product_view_img" src="'+data.imgSrc+'" style="width:100%;max-height:470px;'+ (data.shadow === undefined ? 'box-shadow: 0px 6px 10px rgba(145, 145, 145, 0.25);' : '') +'margin-top:10px"/>\
                <div class="img_view_mask '+ (data.mask !== undefined ? 'hide' : '') +'"></div>\
              </div>\
          </div>'
        //   <a class="btn btn-default mr10 btn-sm productPreview '+ (!data.preview?'hide':'') +'" href="'+ data.preview +'" target="_blank">产品预览</a>
    bt.open({
      title:false,
      area: '700px',
      offest:'auto',
      btn:false,
      content:_html,
      success:function () {
        var area = config && config.imgArea ? config.imgArea : ['650px','450px']
        $('.img_view').attr('style','width: 92%;position: relative;padding: 0 20px;')
        // 产品预览
        $('.img_view img,.img_view_mask').click(function () {
          layer.open({
            type:1,
            title: false,
            area: area,
            closeBtn:2,
            btn:false,
            content:'<img src="'+data.imgSrc+'" style="width:100%" />'
          })
        })
        // 立即购买
        $('.buyNow').click(function(){
            product_recommend.pay_product_sign(type, source, plugin)
        })
      }
    })
  }
}

// true: 消息推送 false: 消息通道
var ConfigIsPush = false;
// 消息推送弹框
var ConfigIndex = -1;

// 打开消息通道/消息推送
function open_three_channel_auth (stype) {
  var _title = '设置消息通道';
  var _area = '650px';
  var isPush = false;
  var assign = '';

  if (stype === 'MsgPush') { // 类型为消息推送
    _title = '设置消息推送'
    _area = ['900px', '603px']
    isPush = true
  } else if (typeof stype != 'undefined' && stype) { // 指定选择消息通道的某个菜单
    assign = stype
  }

  ConfigIsPush = isPush

  ConfigIndex = layer.open({
    type: 1,
    area: _area,
    title: _title,
    closeBtn: 2,
    shift: 5,
    shadeClose: false,
    content: '\
		<div class="bt-form alarm-view">\
			<div class="bt-w-main" style="height: 560px;">\
				<div class="bt-w-menu" ' + (isPush ? 'style="width: 160px;"' : '') + '></div>\
				<div class="bt-w-con pd15" ' + (isPush ? 'style="margin-left: 160px;"' : '') + '>\
					<div class="plugin_body"></div>\
					<div class="plugin_update"></div>\
				</div>\
			</div>\
		</div>',
    success: function () {
      // 获取菜单配置
      getMsgConfig(assign ? assign : '');

      // 卸载/禁用模块
      $('.alarm-view').on('click', '.btn-uninstall', function () {
        uninstallMsgModuleConfig();
      });

      // 立即更新
      $('.alarm-view').on('click', '.btn-update', function () {
        installMsgModuleConfig();
      });
    }
  })
}

// 获取模板配置
function getTemplateMsgConfig (item, shtml) {
  $.post('/'+(ConfigIsPush?'push':'config') + '?action=get_module_template', {
    module_name: item.name
  }, function (res) {
    if (res.status) {
      // 添加菜单内容
      $(".bt-w-main .plugin_body").html(res.msg.trim());
      // 添加底部内容
      var updateInfo = '';
      // 是否更新
      if (item.version !== item.info.version) {
        updateInfo = '【' + item['title'] + '】模块存在新的版本，为了不影响使用，请更新。<button class="btn btn-success btn-sm btn-update">立即更新</button>';
      }
      $(".bt-w-main .plugin_update").html('\
      <div class="box">\
        <div class="info">' + updateInfo + '</div>\
        <div><button class="btn btn-danger btn-sm btn-uninstall">卸载/禁用模块</button></div>\
      </div>');
    } else {
      $(".bt-w-main .plugin_body").html(shtml);
    }
    new Function(item.name + '.init()')()
  })
}

// 获取消息配置
function getMsgConfig (openType) {
  var _api = '/config?action=get_msg_configs'
  if(ConfigIsPush) _api = '/push?action=get_modules_list'

  $.post(_api, function(rdata) {
    var _menu = '';
    var menu_data = $(".alarm-view .bt-w-menu p.bgw").data('data');
    $('.alarm-view .bt-w-menu').html('');
    $.each(rdata, function(index, item) {
      var _default = item.data && item.data.default;
      var _flag = '';
      if (_default) {
        _flag = '<span class="show-default"></span>'
      }
      _menu = $('<p class=\'men_' + item['name'] + '\'>' + item['title'] + _flag + '</p>').data('data', item)
      $('.alarm-view .bt-w-menu').append(_menu)
    });
    $('.alarm-view .bt-w-menu').append('<a class="btlink update_list" onclick="refreshThreeChannelAuth()">更新列表</a>');
    $(".alarm-view .bt-w-menu p").click( function() {
      $(this).addClass('bgw').siblings().removeClass('bgw')
      var _item = $(this).data('data');

      var shtml = '<div class="plugin_user_info c7">\
        <p><b>名称：</b>' + _item.title + '</p>\
        <p><b>版本：</b>' + _item.version + '</p>\
        <p><b>时间：</b>' + _item.date + '</p>\
        <p><b>描述：</b>' + _item.ps + '</p>\
        <p><b>说明：</b><a class="btlink" href="' + _item.help + '" target=" _blank">' + _item.help + '</a></p>\
        <p><button class="btn btn-success btn-sm mt1" onclick="installMsgModuleConfig(\''+ _item.name +'\')">安装模块</button></p>\
      </div>';
      if (_item['setup']) {
        getTemplateMsgConfig(_item, shtml)
      } else {
        $(".bt-w-main .plugin_body").html(shtml);
        $(".bt-w-main .plugin_update").html('');
      }
    });
    if (menu_data) {
      $('.men_' + menu_data['name']).click();
    } else {
      if(typeof openType != 'undefined' && openType){
        $('.alarm-view .bt-w-menu p.men_'+openType).trigger('click')
      }else{
        $('.alarm-view .bt-w-menu p').eq(0).trigger('click')
      }
    }
  })
}

function installMsgModuleConfig (name) {
  var _api = '/config?action=install_msg_module'
  if(ConfigIsPush) _api = '/push?action=install_module'
  name = name ? '.men_' + name : '';
  var _item = $(".alarm-view .bt-w-menu p.bgw" +  name ).data('data');
  var spt = '安装'
  if (_item.setup) spt = '更新'

  layer.confirm('是否要' + spt + '【' + _item.title + '】模块', {
    title: '安装模块',
    closeBtn: 2,
    icon: 0
  }, function() {
    var loadT = layer.msg('正在' + spt + _item.title + '模块中,请稍候...', {
      icon: 16,
      time: 0,
      shade: [0.3, '#000']
    });
    $.post(_api+'&name=' + _item.name + '', function(res) {
      getMsgConfig()
      layer.close(loadT)
      layer.msg(res.msg, {
        icon: res.status ? 1 : 2
      })
    })
  })
}

function uninstallMsgModuleConfig () {
  var _api = '/config?action=uninstall_msg_module'
  if(ConfigIsPush) _api = '/push?action=uninstall_module'

  var _item = $(".alarm-view .bt-w-menu p.bgw").data('data');

  layer.confirm('是否确定要卸载【' + _item.title + '】模块', {
    title: '卸载模块',
    closeBtn: 2,
    icon: 0
  }, function() {
    var loadT = layer.msg('正在卸载' + _item.title + '模块中,请稍候...', {
      icon: 16,
      time: 0,
      shade: [0.3, '#000']
    });
    $.post(_api+'&name=' + _item.name + '', function(res) {
      layer.close(loadT)
      getMsgConfig()
      layer.msg(res.msg, {
        icon: res.status ? 1 : 2
      })
    })
  })
}

function refreshThreeChannelAuth () {
  var _api = '/config?action=get_msg_configs'
  if(ConfigIsPush) _api = '/push?action=get_modules_list'

  var loadT = layer.msg('正在更新模块列表中,请稍候...', {
    icon: 16,
    time: 0,
    shade: [0.3, '#000']
  });
  layer.confirm('是否确定获取最新的模块列表', {
    title: '刷新列表',
    closeBtn: 2,
    icon: 0
  }, function(index) {
    layer.close(index);
    layer.close(ConfigIndex);
    $.post(_api, {
      force: 1
    }, function(rdata) {
      layer.close(loadT)
      open_three_channel_auth(ConfigIsPush?'MsgPush':'');
    })
  })
}

// 文件管理
var fileManage = {
  /**
   * @description 回收站视图
   * @return void
   */
  recycle_bin_view: function () {
    var that = this;
    layer.open({
      title: lan.files.recycle_bin_title,
      type: 1,
      skin: 'recycle_view',
      area: ['1100px', '672px'],
      closeBtn: 2,
      content: '\
			<div class="recycle_bin_view">\
					<div class="re-head">\
							<div style="margin-left: 3px;" class="ss-text">\
									<em>' + lan.files.recycle_bin_on + '</em>\
									<div class="ssh-item">\
													<input class="btswitch btswitch-ios" id="Set_Recycle_bin" type="checkbox">\
													<label class="btswitch-btn" for="Set_Recycle_bin"></label>\
									</div>\
									<em style="margin-left: 20px;">' + lan.files.recycle_bin_on_db + '</em>\
									<div class="ssh-item">\
													<input class="btswitch btswitch-ios" id="Set_Recycle_bin_db" type="checkbox">\
													<label class="btswitch-btn" for="Set_Recycle_bin_db"></label>\
									</div>\
							</div>\
							<span style="line-height: 32px; margin-left: 30px;">' + lan.files.recycle_bin_ps + '</span>\
							<button style="float: right" class="btn btn-default btn-sm btn-clear-database">' + lan.files.recycle_bin_close + '</button>\
					</div>\
					<div class="re-con">\
							<div class="re-con-menu">\
									<p class="on" data-type="1">' + lan.files.recycle_bin_type1 + '</p>\
									<p data-type="2">' + lan.files.recycle_bin_type2 + '</p>\
									<p data-type="3">' + lan.files.recycle_bin_type3 + '</p>\
									<p data-type="4">' + lan.files.recycle_bin_type4 + '</p>\
									<p data-type="5">' + lan.files.recycle_bin_type5 + '</p>\
									<p data-type="6">' + lan.files.recycle_bin_type6 + '</p>\
							</div>\
							<div class="re-con-con pd15" id="recycle_table"></div>\
					</div>\
			</div>',
      success: function () {
        if (window.location.href.indexOf("database") != -1) {
          $(".re-con-menu p:last-child").addClass("on").siblings().removeClass("on");
          $(".re-con-menu p:eq(5)").click();
        } else {
          $(".re-con-menu p:eq(0)").click();
        }
        var render_config = that.render_recycle_list();
        $(".re-con-menu").on('click', 'p', function () {
          var _type = $(this).data('type');
          $(this).addClass("on").siblings().removeClass("on");
          render_config.$refresh_table_list(true);
        });
        // 文件回收站
        $('#Set_Recycle_bin').change(function () {
          that.set_Recycle_bin();
        });
        // 数据库回收站
        $('#Set_Recycle_bin_db').change(function () {
          that.set_Recycle_bin(1);
        });
        // 清空数据库
        $('.btn-clear-database').click(function () {
          that.closeRecycleBin();
        })
      }
    })
  },
  // 回收站渲染列表
  render_recycle_list: function () {
    var that = this;
    $('#recycle_table').empty()
    var recycle_list = bt_tools.table({
      el: '#recycle_table',
      url: '/files?action=Get_Recycle_bin',
      height: 480,
      dataFilter: function (res) {
        var files = [];
        switch ($('.re-con-menu p.on').index()) {
          case 0:
            for (var i = 0; i < res.dirs.length; i++) {
              var item = res.dirs[i];
              files.push($.extend(item, { type: 'folder' }));
            }
            for (var j = 0; j < res.files.length; j++) {
              var item = res.files[j], ext_list = item.dname.split('.'), ext = that.determine_file_type(ext_list[ext_list.length - 1]);
              if (item.name.indexOf('BTDB_') > -1) {
                item.dname = item.dname.replace('BTDB_', '');
                item.name = item.name.replace('BTDB_', '');
                files.push($.extend(item, { type: 'files' }));
              } else if (ext == 'images') {
                files.push($.extend(item, { type: ext }));
              } else {
                files.push($.extend(item, { type: 'files' }));
              }
            }
            break;
          case 1:
            for (var i = 0; i < res.dirs.length; i++) {
              var item = res.dirs[i];
              files.push($.extend(item, { type: 'folder' }));
            }

            break;
          case 2:
            for (var j = 0; j < res.files.length; j++) {
              var item = res.files[j], ext_list = item.dname.split('.'), ext = that.determine_file_type(ext_list[ext_list.length - 1]);
              if (item.name.indexOf('BTDB') == -1) files.push($.extend(item, { type: ext }));
            }
            break;
          case 3:
            for (var j = 0; j < res.files.length; j++) {
              var item = res.files[j], ext_list = item.dname.split('.'), ext = that.determine_file_type(ext_list[ext_list.length - 1]);
              if (ext == 'images') files.push($.extend(item, { type: ext }));
            }

            break;
          case 4:
            for (var j = 0; j < res.files.length; j++) {
              var item = res.files[j], ext_list = item.dname.split('.'), ext = that.determine_file_type(ext_list[ext_list.length - 1]);
              if (ext != 'images' && ext != 'compress' && ext != 'video' && item.name.indexOf('BTDB') == -1) files.push($.extend(item, { type: ext }));
            }
            break;
          case 5:
            for (var j = 0; j < res.dirs.length; j++) {
              var item = res.dirs[j];
              if (item.name.indexOf('BTDB_') > -1) {
                item.dname = item.dname.replace('BTDB_', '');
                item.name = item.name.replace('BTDB_', '');
                files.push($.extend(item, { type: 'files' }));
              }
            }
            // for (var filesKey in files) {
            //     if(files.hasOwnProperty(filesKey))
            // }
            break;
        }
        $('#Set_Recycle_bin').attr('checked', res.status);
        $('#Set_Recycle_bin_db').attr('checked', res.status_db);
        return { data: files }
      },
      column: [
        { type: 'checkbox', 'class': '', width: 18 },
        {
          fid: 'name', title: lan.files.recycle_bin_th1, width: 155, template: function (row) {
            return '<div class="text-overflow" title="' + row.name + '"><i class="file_icon file_' + row.type + '"></i><span style="width:100px">' + row.name + '</span></div>';
          }
        },
        {
          fid: 'dname', title: lan.files.recycle_bin_th2, width: 310, template: function (row) {
            return '<span class="text-overflow" style="width:310px" title="' + row.dname + '">' + row.dname + '</span>';
          }
        },
        {
          fid: 'size', title: lan.files.recycle_bin_th3, width: 70, template: function (row) {
            return '<span class="text-overflow" style="width:70px" title="' + row.size + '">' + bt.format_size(row.size) + '</span>';
          }
        },
        {
          fid: 'time', title: lan.files.recycle_bin_th4, width: 120, template: function (row, index) {
            return '<span class="text-overflow" style="width:120px" title="' + row.time + '">' + bt.format_data(row.time) + '</span>'
          }
        },
        {
          type: 'group', align: 'right', width: 95, title: lan.files.recycle_bin_th5, group: [{
            title: lan.files.recycle_bin_re,
            event: function (row, index, ev, key, _that) {
              that.ReRecycleBin(row.rname, function () {
                _that.$delete_table_row(index);
                that.refresh_page();
              })
            }
          }, {
            title: lan.files.recycle_bin_del,
            event: function (row, index, ev, key, _that) {
              that.DelRecycleBin(row, function () {
                _that.$delete_table_row(index);
              });
            }
          }]
        }
      ],
      tootls: [{ // 批量操作
        type: 'batch',//batch_btn
        positon: ['left', 'bottom'],
        placeholder: '请选择批量操作',
        buttonValue: '批量操作',
        disabledSelectValue: '请选择需要批量操作的端口!',
        selectList: [{
          title: "恢复",
          url: '/files?action=Re_Recycle_bin',
          load: true,
          param: function (row) {
            return { path: row.rname };
          },
          callback: function (_that) {
            bt.confirm({ title: '批量恢复文件', msg: '是否批量恢复选中的文件，是否继续？', icon: 0 }, function (index) {
              layer.close(index);
              _that.start_batch({}, function (list) {
                var html = '';
                for (var i = 0; i < list.length; i++) {
                  var item = list[i];
                  html += '<tr><td>' + item.name + '</td><td><div style="float:right;"><span style="color:' + (item.request.status ? '#20a53a' : 'red') + '">' + (item.request.status ? '恢复成功' : '恢复失败') + '</span></div></td></tr>';
                }
                recycle_list.$batch_success_table({ title: '批量恢复文件', th: '文件名称', html: html });
                recycle_list.$refresh_table_list(true);
                that.refresh_page()
              });
            });
          }
        }, {
          title: "永久删除文件",
          url: '/files?action=Del_Recycle_bin',
          load: true,
          param: function (row) {
            return { path: row.rname };
          },
          callback: function (that) {
            bt.input_confirm({ title: '批量删除文件',value: '删除文件',msg: '批量删除选中的文件后，<span class="color-org">文件将彻底删除，不可恢复</span>，是否继续操作？'}, function () {
              that.start_batch({}, function (list) {
                var html = '';
                for (var i = 0; i < list.length; i++) {
                  var item = list[i];
                  html += '<tr><td>' + item.name + '</td><td><div style="float:right;"><span style="color:' + (item.request.status ? '#20a53a' : 'red') + '">' + (item.request.status ? '删除成功' : '删除失败') + '</span></div></td></tr>';
                }
                recycle_list.$batch_success_table({ title: '批量删除文件', th: '文件名称', html: html });
                recycle_list.$refresh_table_list(true);
              });
            });
          }
        }]
      }]
    });
    bt_tools.$fixed_table_thead('#recycle_table .divtable');
    return recycle_list
  },
  // 恢复文件后刷新当前页面表格数据
  refresh_page: function () {
    // 非数据库类型 && 文件路由
    if (window.location.href.indexOf("files") !== -1) {
      try {
        bt_file.reader_file_list({ path: bt_file.file_path });
      } catch (err) {}
    }
    // 数据库类型 && 数据库路由
    if (window.location.href.indexOf("database") !== -1) {
      try {
        database_table.$refresh_table_list();
      } catch(err) {}
    }
  },
  // 回收站开关
  set_Recycle_bin: function (db) {
    var loadT = layer.msg(lan['public'].the, { icon: 16, time: 0, shade: [0.3, '#000'] });
    var that = this,
        data = {}
    if (db == 1) {
      data = { db: db };
    }
    $.post('/files?action=Recycle_bin', data, function (rdata) {
      layer.close(loadT);
      if (rdata.status) {
        if (db == undefined) {
          var _status = $('#Set_Recycle_bin').prop('checked')
          bt.set_cookie('file_recycle_status', _status);
          try {
            bt_file.is_recycle = _status;
          } catch (err) {}
        } else {
          try {
            recycle_bin_db_open = !recycle_bin_db_open
          } catch (err) {}
        }
      }
      layer.msg(rdata.msg, { icon: rdata.status ? 1 : 5 });
    });
  },
  // 回收站恢复
  ReRecycleBin: function (path, callback) {
    layer.confirm(lan.files.recycle_bin_re_msg, { title: lan.files.recycle_bin_re_title, closeBtn: 2, icon: 3 }, function () {
      var loadT = layer.msg(lan.files.recycle_bin_re_the, { icon: 16, time: 0, shade: [0.3, '#000'] });
      $.post('/files?action=Re_Recycle_bin', 'path=' + encodeURIComponent(path), function (rdata) {
        layer.close(loadT);
        layer.msg(rdata.msg, { icon: rdata.status ? 1 : 5 });
        if (callback) callback(rdata)
      });
    });
  },
  //回收站删除
  DelRecycleBin: function (row, callback) {
    bt.prompt_confirm(lan.files.recycle_bin_del_title, '您确定要删除文件[' + row.name + ']吗，该操作将<span style="color:red;">永久删除该文件</span>，是否继续操作？', function () {
      var loadT = layer.msg(lan.files.recycle_bin_del_the, { icon: 16, time: 0, shade: [0.3, '#000'] });
      $.post('/files?action=Del_Recycle_bin', 'path=' + encodeURIComponent(row.rname), function (rdata) {
        layer.close(loadT);
        layer.msg(rdata.msg, { icon: rdata.status ? 1 : 5 });
        if (callback) callback(rdata)
      });
    });
  },
  //清空回收站
  closeRecycleBin: function () {
    var _this = this;
    bt.prompt_confirm(lan.files.recycle_bin_close, '您确定要清空回收站吗，该操作将<span style="color:red;">永久删除文件</span>，是否继续操作？', function () {
      var loadT = layer.msg("<div class='myspeed'>" + lan.files.recycle_bin_close_the + "</div>", { icon: 16, time: 0, shade: [0.3, '#000'] });
      setTimeout(function () {
        getSpeed('.myspeed');
      }, 1000);
      $.post('/files?action=Close_Recycle_bin', '', function (rdata) {
        layer.close(loadT);
        layer.msg(rdata.msg, { icon: rdata.status ? 1 : 5 });
        _this.render_recycle_list()
        $("#RecycleBody").html('');
      });
    });
  },
  /**
   * @description 文件类型判断，或返回格式类型(不传入type)
   * @param {String} ext
   * @param {String} type
   * @return {Boolean|Object} 返回类型或类型是否支持
   */
  determine_file_type: function (ext, type) {
    var config = {
          images: ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'tiff', 'ico', 'JPG', 'webp'],
          compress: ['zip', 'rar', 'gz', 'war', 'tgz','tar', '7z'],
          video: ['mp4', 'mp3', 'mpeg', 'mpg', 'mov', 'avi', 'webm', 'mkv', 'mkv', 'mp3', 'rmvb', 'wma', 'wmv'],
          ont_text: ['iso', 'xlsx', 'xls', 'doc', 'docx', 'tiff', 'exe', 'so', 'bz', 'dmg', 'apk', 'pptx', 'ppt', 'xlsb', 'pdf']
        },
        returnVal = false;
    if (type != undefined) {
      if (type == 'text') {
        $.each(config, function (key, item) {
          $.each(item, function (index, items) {
            if (items == ext) {
              returnVal = true;
              return false;
            }
          })
        });
        returnVal = !returnVal
      } else {
        if (typeof config[type] == "undefined") return false;
        $.each(config[type], function (key, item) {
          if (item == ext) {
            returnVal = true;
            return false;
          }
        });
      }
    } else {
      $.each(config, function (key, item) {
        $.each(item, function (index, items) {
          if (items == ext) {
            returnVal = key;
            return false;
          }
        })
      });
      if (typeof returnVal == "boolean") returnVal = 'text';
    }
    return returnVal;
  },
}

/*重构版：消息通道调整为告警模块*/

/**
 * @description 安装告警模块视图跳转
 * @param {String} type 模块类型
 * @param {Object} el 刷新的元素类名
 * @param {function} callback 配置成功后的回调函数
 */
function openAlertModuleInstallView(type,el,callback) {
  bt_tools.send({ url: '/config?action=get_msg_configs', data: {} }, function (_configData) {
    switch (type) {
      case 'mail':
        renderMailConfigView(_configData[type],el,callback);
        break;
      case 'dingding':
      case 'feishu':
      case 'weixin':
        renderAlertUrlTypeChannelView(_configData[type],el,callback);
        break;
      case 'wx_account':
      case 'sms':
        alertOtherTypeInstall(_configData[type],el,callback);
        break;
    }
  })
}
/**
 * @description 渲染邮箱配置视图
 */
function renderMailConfigView(data,el,callback) {
  layer.open({
    type:1,
    title: '发送者配置',
    area: ['470px', '400px'],
    btn: ['保存', '取消'],
    skin: 'alert-send-view',
    content: '<div class="bt-form pd15">\
                  <div class="line">\
                          <span class="tname">发送人邮箱</span>\
                          <div class="info-r">\
                                  <input name="sender_mail_value" class="bt-input-text mr5" type="text" style="width: 300px">\
                          </div>\
                  </div>\
                  <div class="line">\
                          <span class="tname">SMTP密码</span>\
                          <div class="info-r">\
                                  <input name="sender_mail_password" class="bt-input-text mr5" type="password" style="width: 300px">\
                          </div>\
                  </div>\
                  <div class="line">\
                          <span class="tname">SMTP服务器</span>\
                          <div class="info-r">\
                                  <input name="sender_mail_server" class="bt-input-text mr5" type="text" style="width: 300px">\
                          </div>\
                  </div>\
                  <div class="line">\
                          <span class="tname">端口</span>\
                          <div class="info-r">\
                                  <input name="sender_mail_port" class="bt-input-text mr5" type="text" style="width: 300px">\
                          </div>\
                  </div>\
                  <ul class="help-info-text c7">\
                          <li>推荐使用465端口，协议为SSL/TLS</li>\
                          <li>25端口为SMTP协议，587端口为STARTTLS协议</li>\
                          <li><a href="'+data.help+'" target="_blank" class="btlink">配置教程</a></li>\
                  </ul>\
          </div>',
    success: function() {
      if (!$.isEmptyObject(data) && !$.isEmptyObject(data.data.send)) {
        var send = data.data.send,
            mail_ = send.qq_mail || '',
            stmp_pwd_ = send.qq_stmp_pwd || '',
            hosts_ = send.hosts || '',
            port_ = send.port || '';

        $('input[name=sender_mail_value]').val(mail_)
        $('input[name=sender_mail_password]').val(stmp_pwd_)
        $('input[name=sender_mail_server]').val(hosts_)
        $('input[name=sender_mail_port]').val(port_)
      } else {
        $('input[name=sender_mail_port]').val('465')
      }
    },
    yes: function(indexs) {
      var _email = $('input[name=sender_mail_value]').val(),
          _passW = $('input[name=sender_mail_password]').val(),
          _server = $('input[name=sender_mail_server]').val(),
          _port = $('input[name=sender_mail_port]').val();

      if (_email == '') return layer.msg('邮箱地址不能为空！', { icon: 2 });
      if (_passW == '') return layer.msg('STMP密码不能为空！', { icon: 2 });
      if (_server == '') return layer.msg('STMP服务器地址不能为空！', { icon: 2 });
      if (_port == '') return layer.msg('请输入有效的端口号', { icon: 2 });

      if (!data.setup) {
        bt_tools.send({ url: '/config?action=install_msg_module&name=' + data.name, data: {} }, function (res) {
          if (res.status) {
            bt_tools.send({url:'/config?action=set_msg_config&name=mail',data:{send: 1,
                qq_mail: _email,
                qq_stmp_pwd: _passW,
                hosts: _server,
                port: _port
              }
            }, function (configM) {
              if (configM.status) {
                layer.close(indexs)
                layer.msg(configM.msg, {
                  icon: configM.status ? 1 : 2
                })
                if($('.alert-view-box').length >= 0) $('.alert-view-box .tab-nav-border span:eq(1)').click()
                if($('.content_box.news-channel').length > 0) {
                  $('.bt-w-menu p').eq(0).click()
                }
                if(el) $(el).click()
                if(callback) callback()
              }
            },'设置邮箱配置')
          } else {
            layer.msg(res.msg,{icon:2})
          }
        },'创建' + data.title + '模块')
      } else {
        bt_tools.send({
          url: '/config?action=set_msg_config&name=mail', data: {
            send: 1,
            qq_mail: _email,
            qq_stmp_pwd: _passW,
            hosts: _server,
            port: _port
          }
        }, function (configM) {
          if (configM.status) {
            layer.close(indexs)
            layer.msg(configM.msg, {
              icon: configM.status ? 1 : 2
            })
          }
          if($('.content_box.news-channel').length > 0) {
            $('.bt-w-menu p').eq(0).click()
          }
          if(el) $(el).click()
          if(callback) callback()
        },'设置邮箱配置')
      }
    }
  })
}
/**
 * @description 渲染url通道方式视图
 */
function renderAlertUrlTypeChannelView(data,el,callback) {
  var isEmpty = $.isEmptyObject(data.data)
  layer.open({
    type:1,
    title: data['title']+'机器人配置',
    area: ['520px', '345px'],
    btn: ['保存', '取消'],
    skin: 'alert-send-view',
    content: '<div class="pd15 bt-form">\
              <div class="line"><span class="tname">名称</span><div class="info-r"><input type="text" name="chatName" value="'+(isEmpty?'':data.data.list.default.title)+'" class="bt-input-text mr10 " style="width:350px;" placeholder="机器人名称或备注"></div></div>\
              <div class="line">\
              <span class="tname">URL</span><div class="info-r">\
                  <textarea name="channel_url_value" class="bt-input-text mr5" type="text" placeholder="请输入'+(data.title)+'机器人url" style="width: 350px; height:120px; line-height:20px"></textarea>\
              </div>\
              <ul class="help-info-text c7">\
                      <li><a class="btlink" href="'+(data.help)+'" target="_blank">如何创建'+(data.title)+'机器人</a></li>\
              </ul>\
              </div></div>',
    success: function() {
      if (!$.isEmptyObject(data.data)) {
        var url = data['data'][data.name+'_url'] || '';
        $('textarea[name=channel_url_value]').val(url);
      }
    },
    yes: function(indexs) {
      var _index = $('.alert-view-box span.on').index();
      var _url = $('textarea[name=channel_url_value]').val(),
          _name = $('input[name=chatName]').val();
      if (_name == '') return layer.msg('请输入机器人名称或备注', { icon: 2 })
      if (_url == '') return layer.msg('请输入' + data.title + '机器人url', { icon: 2 })
      if (!data.setup) {
        bt_tools.send({ url: '/config?action=install_msg_module&name=' + data.name, data: {} }, function (res) {
          if (res.status) {
            setTimeout(function () {
              bt_tools.send({
                url: '/config?action=set_msg_config&name=' + data.name, data: {
                  url: _url,
                  title: _name,
                  atall: 'True'
                }
              }, function (rdata) {
                layer.close(indexs)
                layer.msg(rdata.msg, {
                  icon: rdata.status ? 1 : 2
                })
                if ($('.alert-view-box').length >= 0) {
                  $('.alert-view-box .tab-nav-border span:eq('+_index+')').click()
                }
                if($('.content_box.news-channel').length > 0) {
                  $('.bt-w-menu p').eq(0).click()
                }
                if(el) $(el).click()
                if(callback) callback()
              },'设置' + data.title + '配置')
            }, 100);
          } else {
            layer.msg(res.msg,{icon:2})
          }
        },'创建' + data.title + '模块')
      } else {
        bt_tools.send({
          url: '/config?action=set_msg_config&name=' + data.name, data: {
            url: _url,
            title: _name,
            atall: 'True'
          }
        }, function (rdata) {
          layer.close(indexs)
          layer.msg(rdata.msg, {
            icon: rdata.status ? 1 : 2
          })
          if ($('.alert-view-box').length >= 0) {
            $('.alert-view-box .tab-nav-border span:eq('+_index+')').click()
          }
          if($('.content_box.news-channel').length > 0) {
            $('.bt-w-menu p').eq(0).click()
          }
          if(el) $(el).click()
          if(callback) callback()
        },'设置' + data.title + '配置')
      }
    }
  })
}
/**
 * @description 微信公众号、短信模块安装
 */
function alertOtherTypeInstall(data,el,callback) {
  if (!data.setup) {
    bt_tools.send({ url: '/config?action=install_msg_module&name=' + data.name, data: {} }, function (res) {
      layer.msg(res.msg, {
        icon: res.status ? 1 : 2
      })
      if (!res.status) return false;
      if (data.name === 'wx_account') {
        var _data = data.data;
        if (!_data.is_subscribe || !_data.is_bound) renderAccountAlertView()
      }
      if ($('.alert-view-box').length >= 0) {
        var _index = $('.alert-view-box span.on').index();
        $('.alert-view-box .tab-nav-border span:eq('+_index+')').click()
      }
      if($('.content_box.news-channel').length > 0) {
        $('.bt-w-menu p').eq(0).click()
      }
      if(el) $(el).click()
      if(callback) callback()
    },'创建' + data.title + '模块')
  } else if(data.name === 'wx_account'){
    renderAccountAlertView(el);
  }
}
/**
 * @description 微信公众号
 */
function renderAccountAlertView(el,callback) {
  layer.open({
    type:1,
    title: '微信公众号',
    area: ['420px', '280px'],
    skin: 'BTwxAccountView',
    content:'<div class="wx_account_box pd15"><div class="bt-form">\
          <div class="form-item">\
              <div class="form-label">绑定微信公众号</div>\
              <div class="form-content">\
                  <div class="bind_account hide">\
                      <span style="color: #20a53a;">已绑定</span>\
                  </div>\
                  <div class="nobind_account">\
                      <span class="red">未绑定</span>\
                      <button class="btn btn-xs btn-success btn-bind-account">立即绑定</button>\
                  </div>\
              </div>\
          </div>\
          <div class="form-item">\
              <div class="form-label">绑定微信账号</div>\
              <div class="form-content">\
                  <div class="bind_wechat hide">\
                      <div class="userinfo"></div>\
                  </div>\
                  <div class="nobind_wechat">\
                      <span class="red">未绑定</span>\
                  </div>\
                  <button class="btn btn-xs btn-success btn-bind-wechat">立即绑定</button>\
              </div>\
          </div>\
          <div class="form-item hide">\
              <div class="form-label">今日剩余发送次数</div>\
              <div class="form-content">\
                  <span class="account_remaining">0</span>\
                  <button class="btn btn-xs btn-success btn-send-test">发送测试消息</button>\
              </div>\
          </div>\
      </div>\
      <ul class="help-info-text c7">\
          <li>没有绑定微信公众号无法接收面板告警消息</li>\
          <li>当前为体验版,限制每个宝塔账号发送频率100条/天</li>\
      </ul>\
      </div>',
    success: function() {
      getWxAccountConfig(el,callback);
      // 发送测试信息
      $('.btn-send-test').click(function () {
        bt_tools.send({ url: '/config?action=get_msg_fun', data: { module_name: 'wx_account', fun_name: 'push_data', msg: '发送测试信息' } }, function (res) {
          if (res.status) {
            var num = Number($('.account_remaining').html());
            if (!isNaN(num)) {
              num -= 1;
              $('.account_remaining').text(num);
            }
          }
        },'测试信息')
      });
      wxAccountBind(el,callback);
    }
  })
}
/**
 * @description 获取微信公众号配置
 */
 function getWxAccountConfig(el,callback) {
  bt_tools.send({ url: '/config?action=get_msg_fun', data: {module_name:'wx_account',fun_name:'get_web_info'} }, function (res) {
    if (res.status === false) {
      return layer.msg(res.msg.res,{icon:2})
    }
    var data = res && res.msg && res.msg.res ? res.msg.res : {};
    // 绑定微信账号
    if (data.is_bound === 1) {
      $('.userinfo').html('<img src="' + data.head_img + '" /><div>' + data.nickname + '</div>');
      $('.btn-bind-wechat').text('更换微信账号');
      $('.bind_wechat').removeClass('hide');
      $('.nobind_wechat').addClass('hide');
    } else {
      $('.btn-bind-wechat').text('立即绑定');
      $('.bind_wechat').addClass('hide');
      $('.nobind_wechat').removeClass('hide');
    }
    // 判断是否绑定公众号
    if (data.is_subscribe === 1) {
      $('.bind_account').removeClass('hide');
      $('.nobind_account').addClass('hide');
      if($('.content_box.news-channel').length > 0) {
        $('.bt-w-menu p').eq(0).click()
      }
      if(el) $(el).click()
      if(callback) callback()
    } else {
      $('.bind_account').addClass('hide');
      $('.nobind_account').removeClass('hide');
    }
    // 判断是否存在发送消息
    if (data.remaining === undefined) {
      $('.account_remaining').parents('.form-item').addClass('hide');
    } else {
      $('.account_remaining').parents('.form-item').removeClass('hide');
      $('.account_remaining').text(data.remaining);
    }
  }, {load:'获取绑定信息',verify:false})
}

function wxAccountBind(el,callback) {
  // 绑定微信公众号
  $('.btn-bind-account').click(function () {
    var that = this
    layer.open({
      type: 1,
      area: '280px',
      title: '绑定微信公众号',
      content:
          '<div class="bind_wechat_box pd20">\
              <div class="text-center">微信扫码</div>\
              <div class="mt10">\
                  <div class="qrcode" style="text-align: center;">\
                      <img src="https://www.bt.cn/Public/img/bt_wx.jpg" style="width: 180px;"/>\
                  </div>\
              </div>\
          </div>',
      cancel: function () {
        if ($(that).hasClass('bterror')) {
          $('.alert-view-box span.on').click()
        } else {
          getWxAccountConfig(el,callback)
        }
      }
    });
  })
  // 更换绑定账号
  $('.btn-bind-wechat').click(function () {
    var that = this;
    layer.open({
      type:1,
      area: '280px',
      title: '绑定微信账号',
      content: '<div class="bind_wechat_box pd20">\
                      <div class="text-center">微信扫码</div>\
                      <div class="mt10">\
                          <div class="qrcode" id="wechat-qrcode" style="text-align: center;"></div>\
                      </div>\
                  </div>',
      success: function(layers, indexs){
        bt_tools.send({ url: '/config?action=get_msg_fun', data: { module_name: 'wx_account', fun_name: 'get_auth_url' } }, function (res) {
          if (res.status === false) {
            layer.close(indexs)
            return layer.msg(res.msg.res,{icon:2})
          }
          jQuery.ajax({
            url: "/static/js/jquery.qrcode.min.js",
            dataType: "script",
            cache: true
          }).done(function() {
            $('#wechat-qrcode').qrcode({
              render: 'canvas',
              width: 180,
              height: 180,
              text: res.msg.res,
              correctLevel: 1
            });
          });
        },{load:'生成二维码信息',verify:false})
      },
      cancel: function() {
        if ($(that).hasClass('bterror')) {
          $('.alert-view-box span.on').click()
        } else {
          getWxAccountConfig()
        }
      }
    });
  });
}
/*重构版结束*/

var rsa = {
    publicKey: null,
    /**
     * @name 使用公钥加密
     * @param {string} text
     * @returns string
     */
    encrypt_public:function(text){
        this.publicKey = document.querySelector(".public_key").attributes.data.value;
        if(this.publicKey.length < 10) return text;
        var encrypt = new JSEncrypt();
        encrypt.setPublicKey(this.publicKey);
        return encrypt.encrypt(text);
    },
    /**
     * @name 使用公钥解密
     * @param {string} text
     * @returns string
     */
    decrypt_public:function(text){
        this.publicKey = document.querySelector(".public_key").attributes.data.value;
        if(this.publicKey.length < 10) return null;
        var decrypt = new JSEncrypt();
        decrypt.setPublicKey(this.publicKey);
        return decrypt.decryptp(text);
    }
}
