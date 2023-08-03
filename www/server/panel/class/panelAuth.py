#coding: utf-8
#-------------------------------------------------------------------
# 宝塔Linux面板
#-------------------------------------------------------------------
# Copyright (c) 2015-2019 宝塔软件(http:#bt.cn) All rights reserved.
#-------------------------------------------------------------------
# Author: hwliang <hwl@bt.cn>
#-------------------------------------------------------------------

#------------------------------
# AUTH验证接口
#------------------------------

import public,time,json,os,re
# from pluginAuth import Plugin
try:
    from BTPanel import session,cache
except:
    pass

class panelAuth:
    __product_list_path = 'data/product_list.pl'
    __product_bay_path = 'data/product_bay.pl'
    __product_id = '100000011'

    def create_serverid(self,get):
        try:
            userPath = 'data/userInfo.json'
            if not os.path.exists(userPath): return public.returnMsg(False,'请先登陆宝塔官网用户')
            tmp = public.readFile(userPath)
            if len(tmp) < 2: tmp = '{}'
            data = json.loads(tmp)
            if not data: return public.returnMsg(False,'请先登陆宝塔官网用户')
            if not 'serverid' in data:
                data['serverid'] = self.get_serverid()
                public.writeFile(userPath,json.dumps(data))
            return data
        except: return public.returnMsg(False,'请先登陆宝塔官网用户')

    def get_serverid(self,force = False):
        '''
            @name 重新生成serverid
            @author hwliang<2021-06-22>
            @return string
        '''
        serverid_file = 'data/sid.pl'
        if os.path.exists(serverid_file) and not force:
            serverid = public.readFile(serverid_file)
            if re.match("^\w{64}$",serverid): return serverid
        s1 = self.get_mac_address() + self.get_hostname()
        s2 = self.get_cpuname()
        serverid = public.md5(s1) + public.md5(s2)
        public.writeFile(serverid_file,serverid)
        return serverid

    def get_wx_order_status(self,get):
        """
        检查支付状态
        @get.wxoid 支付id
        """
        params = {}
        params['wxoid'] = get.wxoid
        if 'kf' in get: params['kf'] = get.kf

        data = self.send_cloud('check_order_pay_status', params)
        if not data: return public.returnMsg(False,'连接服务器失败!')
        if data['status'] == True:
            self.flush_pay_status(get)
            if 'get_product_bay' in session: del(session['get_product_bay'])

            buy_oid = '_buy_code_id'.format(params['wxoid'])
            buy_code_key = cache.get(buy_oid)
            if buy_code_key:
                cache.delete(buy_code_key)
                cache.delete(buy_oid)
        return data

    def create_plugin_other_order(self,get):
        pdata = self.create_serverid(get)
        pdata['pid'] = get.pid
        pdata['cycle'] = get.cycle
        p_url = public.GetConfigValue('home') + '/api/Pluginother/create_order'
        if get.type == '1':
            pdata['renew'] = 1
            p_url = public.GetConfigValue('home') + '/api/Pluginother/renew_order'
        return json.loads(public.httpPost(p_url,pdata))

    def get_order_stat(self,get):
        pdata = self.create_serverid(get)
        pdata['order_id'] = get.oid
        p_url = public.GetConfigValue('home') + '/api/Pluginother/order_stat'
        if get.type == '1':  p_url = public.GetConfigValue('home') + '/api/Pluginother/re_order_stat'
        return json.loads(public.httpPost(p_url,pdata))

    def check_serverid(self,get):
        if get.serverid != self.create_serverid(get): return False
        return True

    def get_plugin_price(self,get):
        """
        @name 获取插件价格
        @author cjxin<2022-07-28>
        @param get.pid 插件id
        @param get.pluginName 插件名称
        @return dict
        """
        try:
            userPath = 'data/userInfo.json'
            if not os.path.exists(userPath):
                return public.returnMsg(False,'请先登陆宝塔官网帐号!')

            pid = 0
            if 'pid' in get: pid = get.pid
            if not pid:
                if not 'pluginName' in get:
                    return public.returnMsg(False,'参数错误!')
                pid = self.get_plugin_info(get.pluginName)['id']

            if not pid: return public.returnMsg(False,'参数错误!')

            params = {}
            params['pid'] = pid
            data = self.send_cloud('get_product_discount', params)
            return data
        except:
            del(session['get_product_list'])
            return public.returnMsg(False,'正在同步信息，请重试!' + public.get_error_info())


    def get_plugin_info(self,pluginName):
        data = self.get_business_plugin(None)
        if not data: return None
        for d in data:
            if d['name'] == pluginName: return d
        return None

    def get_plugin_list(self,get):
        try:
            import PluginLoader
            PluginLoader.get_plugin_list(1)
            if not session.get('get_product_bay') or not os.path.exists(self.__product_bay_path):
                data = self.send_cloud('get_order_list_byuser', {})
                if data: public.writeFile(self.__product_bay_path,json.dumps(data))
                session['get_product_bay'] = True
            data = json.loads(public.readFile(self.__product_bay_path))
            return data
        except: return None

    # def get_buy_code(self,get):
    #     params = {}
    #     params['pid'] = get.pid
    #     params['cycle'] = get.cycle
    #     data = self.send_cloud('create_order', params)
    #     if not data: return public.returnMsg(False,'连接服务器失败!')
    #     return data

    def get_buy_code(self, get):
        """
        获取支付二维码
        """
        params = {}
        params['pid'] = get.pid
        params['cycle'] = get.cycle
        params['num'] = 1 #购买数量
        params['version'] = public.version()
        if 'num' in get: params['num'] = get.num
        if 'source' in get: params['source'] = get.source
        if 'coupon' in get:params['coupon'] = get.coupon

        # key = '{}_{}_get_buy_code'.format(params['pid'], params['cycle'])
        # data = cache.get(key)
        # if data: return data

        data = self.send_cloud('create_order', params)
        if not data: return public.returnMsg(False, '连接服务器失败!')
        # cache.set(key, data, 120)
        # try:
        #     cache.set('{}_buy_code_id'.format(data['data']['oid']), key, 120)
        # except:pass
        return data

    # def check_pay_status(self,get):
    #     params = {}
    #     params['id'] = get.id
    #     data = self.send_cloud('check_product_pays', params)
    #     if not data: return public.returnMsg(False,'连接服务器失败!')
    #     if data['status'] == True:
    #         self.flush_pay_status(get)
    #         if 'get_product_bay' in session: del(session['get_product_bay'])
    #     return data

    def check_pay_status(self,get):
        """
        检查支付状态
        @get.id 支付id
        """
        params = {}
        params['id'] = get.id
        data = self.send_cloud('check_product_pays', params)
        if not data: return public.returnMsg(False,'连接服务器失败!')
        if data['status'] == True:
            self.flush_pay_status(get)
            if 'get_product_bay' in session: del(session['get_product_bay'])

            buy_oid = '_buy_code_id'.format(params['id'])
            buy_code_key = cache.get(buy_oid)
            if buy_code_key:
                cache.delete(buy_code_key)
                cache.delete(buy_oid)
        return data

    def flush_pay_status(self,get):
        if 'get_product_bay' in session: del(session['get_product_bay'])
        data = self.get_plugin_list(get)
        if not data: return public.returnMsg(False,'连接服务器失败!')
        return public.returnMsg(True,'状态刷新成功!')

    def get_renew_code(self):
        pass

    def check_renew_code(self):
        pass

    def get_business_plugin(self,get):
        try:
            if not session.get('get_product_list') or not os.path.exists(self.__product_list_path):
                data = self.send_cloud('get_product_list', {})
                if data: public.writeFile(self.__product_list_path,json.dumps(data))
                session['get_product_list'] = True
            data = json.loads(public.readFile(self.__product_list_path))
            return data
        except: return None

    def get_ad_list(self):
        pass

    def check_plugin_end(self):
        pass


    def get_coupons(self,get):
        """
        @name 获取用户抵扣卷列表
        @param uid 用户id
        """
        params = {}
        data = self.send_cloud_v2('v2/user/get_coupons', params)
        return data

    def get_credits(self,get):
        """
        @获取用户余额
        @param uid 用户id
        """
        params = {}
        data = self.send_cloud_v2('v2/user/get_credits', params)
        return data

    def create_with_credit_by_panel(self,get):
        """
        @name 使用余额购买
        @param uid 用户id
        @param product_id 产品id
        @param cycle 购买周期
        @param num 购买数量
        @param coupon 优惠券id
        """
        params = {}
        params['product_id'] = int(get.pid)
        params['cycle'] = get.cycle
        params['num'] = 1 #购买数量
        if 'num' in get: params['num'] = get.num
        if 'coupon' in get: params['coupon'] = get.coupon

        data = self.send_cloud_v2('v2/order/product/create_with_credit_by_panel', params)
        return data

    def rest_unbind_count(self,get):
        """
        @name 获取当前订单可解绑次数
        """
        params = {}
        data = self.send_cloud_v2('v2/authorization_v1/rest_unbind_count', params)
        return data

    def unbind_authorization(self,get):
        """
        @name 解绑专业版/企业版
        """
        params = {}
        data = self.send_cloud_v2('v2/authorization_v1/unbind_authorization', params)
        return data

    def get_pay_unbind_count(self,get):
        """
        @name 购买解绑次数
        """
        params = {}
        params['product_id'] = int(get.pid)
        data = self.send_cloud_v2('v2/order/unbind_count/create', params)
        return data


    def get_re_order_status_plugin(self,get):
        params = {}
        params['pid'] = getattr(get,'pid',0)
        data = self.send_cloud('get_re_order_status', params)
        if not data: return public.returnMsg(False,'连接服务器失败!')
        if data['status'] == True:
            self.flush_pay_status(get)
            if 'get_product_bay' in session: del(session['get_product_bay'])
        return data

    def get_voucher_plugin(self,get):
        params = {}
        params['pid'] = getattr(get,'pid',0)
        params['status'] = '0'
        data = self.send_cloud('get_voucher', params)
        if not data: return []
        return data

    def get_all_voucher_plugin(self,get):
        """
        @name 获取所有可用的优惠券
        @param pid 产品id, 100000000表示获取所有
        """
        params = {}
        params['pid'] = getattr(get,'pid',0)
        params['status'] = '0'
        data = self.send_cloud('get_all_voucher', params)
        if not data: return []
        return data

    def create_order_voucher_plugin(self,get):
        params = {}
        params['pid'] = getattr(get,'pid',0)
        params['code'] = getattr(get,'code',0)
        data = self.send_cloud('create_order_voucher', params)
        if not data: return public.returnMsg(False,'连接服务器失败!')
        if data['status'] == True:
            self.flush_pay_status(get)
            if 'get_product_bay' in session: del(session['get_product_bay'])
        return data


    def send_cloud(self,module,params):
        try:
            cloudURL = public.GetConfigValue('home') + '/api/Plugin/'
            userInfo = self.create_serverid(None)
            params['os'] = 'Linux'
            if 'status' in userInfo:
                params['uid'] = 0
                params['serverid'] = ''
            else:
                params['uid'] = userInfo['uid']
                params['serverid'] = userInfo['serverid']
                params['access_key'] = userInfo['access_key']

            try:
                result = public.httpPost(cloudURL + module,params)
            except Exception as ex:
                raise public.error_conn_cloud(str(ex))
            result = json.loads(result.strip())
            if not result: return None
            return result
        except: return None

    def send_cloud_pro(self,module,params):
        try:
            cloudURL = public.GetConfigValue('home') + '/api/invite/'
            userInfo = self.create_serverid(None)
            params['os'] = 'Linux'
            if 'status' in userInfo:
                params['uid'] = 0
                params['serverid'] = ''
            else:
                params['uid'] = userInfo['uid']
                params['serverid'] = userInfo['serverid']
                params['access_key'] = userInfo['access_key']
            result = public.httpPost(cloudURL + module,params)

            result = json.loads(result)
            if not result: return None
            return result
        except: return None

    def get_voucher(self,get):
        params = {}
        params['product_id'] = self.__product_id
        params['status'] = '0'
        data = self.send_cloud_pro('get_voucher', params)
        return data




    def get_order_status(self,get):
        params = {}
        data = self.send_cloud_pro('get_order_status', params)
        return data


    def get_product_discount_by(self,get):
        params = {}
        data = self.send_cloud_pro('get_product_discount_by', params)
        return data

    def get_re_order_status(self,get):
        params = {}
        data = self.send_cloud_pro('get_re_order_status', params)
        return data

    def create_order_voucher(self,get):
        code = getattr(get,'code','1')
        params = {}
        params['code'] = code
        data = self.send_cloud_pro('create_order_voucher', params)
        return data

    def create_order(self,get):
        cycle = getattr(get,'cycle','1')
        params = {}
        params['cycle'] = cycle
        data = self.send_cloud_pro('create_order', params)
        return data

    def get_mac_address(self):
        import uuid
        mac=uuid.UUID(int = uuid.getnode()).hex[-12:]
        return ":".join([mac[e:e+2] for e in range(0,11,2)])

    def get_hostname(self):
        import socket
        try:
            hostname = socket.getfqdn(socket.gethostname())
        except:
            # 尝试通过文件获取
            hostname_file = '/etc/hostname'
            proc_hostname_file = '/proc/sys/kernel/hostname'
            if os.path.exists(proc_hostname_file):
                hostname = public.readFile(proc_hostname_file).strip()
            elif os.path.exists(hostname_file):
                hostname = public.readFile(hostname_file).strip()
            else:
                # 通过命令获取
                hostname = public.ExecShell("hostname")[0].strip()

        # 如果都获取不到，则使用默认值
        if not hostname:
            hostname = 'localhost'
        return hostname

    def get_cpuname(self):
        return public.ExecShell("cat /proc/cpuinfo|grep 'model name'|cut -d : -f2")[0].strip()


    def get_plugin_remarks(self,get):
        ikey = 'plugin_remarks'
        if ikey in session:
            return session.get(ikey)
        data = self.send_cloud_wpanel('get_plugin_remarks',{})
        if not data: return public.returnMsg(False,'连接服务器失败!')
        session[ikey] = data
        return data

    def set_user_adviser(self,get):
        params = {}
        params['status'] = get.status
        data = self.send_cloud_wpanel('set_user_adviser',params)
        if not data: return public.returnMsg(False,'连接服务器失败!');
        return data

    def send_cloud_wpanel(self,module,params):
        try:
            cloudURL = public.GetConfigValue('home') + '/api/panel/'
            userInfo = self.create_serverid(None)
            if 'status' in userInfo:
                params['uid'] = 0
                params['serverid'] = ''
            else:
                params['uid'] = userInfo['uid']
                params['serverid'] = userInfo['serverid']
            params['os'] = 'Linux'
            result = public.httpPost(cloudURL + module,params)

            result = json.loads(result)
            if not result: return None
            return result
        except: return None


    def send_cloud_v2(self,module,params):
        try:
            cloudURL = 'https://www.bt.cn/api/'
            userInfo = self.create_serverid(None);
            if 'status' in userInfo:
                params['uid'] = 0
                params['serverid'] = ''
            else:
                params['uid'] = userInfo['uid']
                params['serverid'] = userInfo['serverid']
                params['access_key'] = userInfo['access_key']
            params['os'] = 'Windows'
            result = public.httpPost(cloudURL + module,params)

            result = json.loads(result)
            if not result: return None
            return result
        except: return None