<template>
    <div class="commonInfoFindForm">
      <el-form rel="form" :model="findInfo">
        <el-row>
          <el-col :span="8">
            <el-form-item :label="findInfo.message">
              <el-date-picker
                v-model="findInfo.startDate"
                type="date"
                placeholder="选择开始日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="1" class="span-and">
            <span >至</span>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-date-picker
                v-model="findInfo.endDate"
                type="date"
                placeholder="选择结束日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="审核状态">
              <el-select v-model="findInfo.status" placeholder="选择审核状态">
                <el-option label="全部" value=""></el-option>
                <el-option label="已审核" value="2"></el-option>
                <el-option label="未审核" value="1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="1">
            <el-button type="primary" style="padding: 10px 30px;" @click="findInfo.callback">查询</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
</template>

<script>
	export default {
		name: 'commonInfoFindForm',
    props: ['findInfo'],
    data() {
			return {
				/*findInfo : {
					startDate : '', //进货单最早时间
          endDate : '',//进货单最迟时间
          status : '',//进货单审核状态
        }*/
      }
    }
	}
</script>

<style scoped>
  .span-and{
    margin-top: 6px;
    margin-left: -8px;
  }
</style>
