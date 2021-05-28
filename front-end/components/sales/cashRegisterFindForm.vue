<template>
  <el-form rel="form" :model="findInfo">
    <el-row>
      <el-col :span="8">
        <el-form-item label="选择销售时间段">
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
        <el-form-item label="指定查询">
          <el-input v-model="findInfo.key" placeholder="指定内容查询" style="width:190px;"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="1">
        <el-button type="primary" style="padding: 10px 30px;">查询</el-button>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
	export default {
		name: '',
    props : ['findInfo']
	}
</script>

<style scoped>
  .span-and{
    margin-top: 6px;
    margin-left: -8px;
  }
</style>
