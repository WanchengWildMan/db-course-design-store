<template>
    <div class="purchaseListInfo">
      <v-bar-title vBarTitle="进货单清单"></v-bar-title>
      <el-card>
        <common-find-form
          :findInfo="findInfo"></common-find-form>
        <purchase-list-info-table
        :tableData="tableData"></purchase-list-info-table>
        <common-pagination
          :pageModule="pageModule"></common-pagination>
      </el-card>
    </div>
</template>

<script>
  import vBarTitle from 'components/common/barTitle.vue'
  import commonFindForm from 'components/common/commonFindForm'
  import purchaseListInfoTable from 'components/purchase/purchaseListInfoTable.vue'
  import commonPagination from 'components/common/commonPagination'

  import commonFindMixin from 'mixin/commonFindMixin'
  import paginationMixin from 'mixin/paginationMixin'

  import bus from 'components/common/js/bus'
	export default {
  	name  : 'purchaseListInfo',
    mixins : [commonFindMixin, paginationMixin],
    data () {
  		return{
        tableData : []
      }
    },
    created() {
      this.initCommonFind();
      this.initPageModule();
      this.updateCommonFind({
        message : '选择进货时间段',
        callback : this.findPurchaseByPage
      });
      this.findPurchaseByPage();
      this.updatePageModule({
        callback : this.findPurchaseByPage
      });
      bus.$on('findPurchaseByPageToTable',()=>{
        this.findPurchaseByPage();
      });
    },
    components : {
      vBarTitle, commonFindForm, purchaseListInfoTable, commonPagination
    },
    methods : {
      findPurchaseByPage() {
        let params = {
          'r.systemTime' : {
            startDate : this.formatsStartDate(this.findInfo.startDate),
            endDate : this.formatsEndDate(this.findInfo.endDate),
          },
          'r.Status' : this.findInfo.status,
        };
        this.$http.get('/api/purchase/findPurchaseByPage',{
          params : {
            findInfo : JSON.stringify(params),
            pageInfo : JSON.stringify({
              page : this.pageModule.page, // 每页显示数据条数
              currentPage : this.pageModule.currentPage, //当前页
            })
          }
        }, {}).then((req)=>{
          if(req.ok) {
            let result = req.body.result;
            if(result.code){
              this.tableData = result.result[0];
              this.pageModule.total =result.result[1][0].count;
            }else{
              this.$message.error(result.msg);
            }
          }
        },()=>{
          this.$message.error('连接服务器失败');
        })
      },
    }
	}
</script>

<style scoped>
</style>
