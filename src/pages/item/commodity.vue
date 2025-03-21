<template>
  <v-data-table
    :headers="headers"
    :items="tableDataProcessed"
    sort-by="calories"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar
        flat
      >
        <v-toolbar-title>{{ TITLE }}</v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>
        <v-dialog
          v-model="dialog"
          max-width="500px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="primary"
              dark
              class="mb-2"
              v-bind="attrs"
              v-on="on"
            >
              添加
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      v-model="editedItem.name"
                      label="Dessert name"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      v-model="editedItem.calories"
                      label="Calories"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      v-model="editedItem.fat"
                      label="Fat (g)"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      v-model="editedItem.carbs"
                      label="Carbs (g)"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      v-model="editedItem.protein"
                      label="Protein (g)"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="blue darken-1"
                text
                @click="close"
              >
                Cancel
              </v-btn>
              <v-btn
                color="blue darken-1"
                text
                @click="save"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
              <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
        small
        class="mr-2"
        @click="editItem(item)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        small
        @click="deleteItem(item)"
      >
        mdi-delete
      </v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn
        color="primary"
        @click="initialize"
      >
        Reset
      </v-btn>
    </template>
  </v-data-table>
</template>
<script>
export default {
  data: () => ({
    TITLE: '商品管理',
    dialog: false,
    dialogDelete: false,
    headers: [
      {
        text: '商品条形码',
        align: 'start',
        value: 'barcode',
      },
      { text: '商品名称', value: 'name' },
      { text: '商品种类', value: 'category.name' },
      { text: '规格型号', value: 'format' },
      { text: '单位', value: 'unit.unitName' },
      { text: '售价', value: 'costPrice' },
      { text: '折扣率', value: 'discountRate' },
      { text: '库存下限', value: 'quantityUpperLimit' },
      { text: '库存上限', value: 'quantityLowerLimit' },
      { text: '供应商', value: 'provide.name' },
      { text: '创建日期', value: 'createDate' },
      { text: '修改日期', value: 'updateDate' },
      { text: '备注', value: 'remark' },


    ],
    tableDataProcessed: [],
    editedIndex: -1,
    editedItem: {},
    defaultItem: {
      name: '',
      barcode: '',
      category: { name: '' },
      format: '',
      unit: { unitName: '' },
      costPrice: 0,
      discountRate: 1,
      quantityUpperLimit: null,
      quantityLowerLimit: 0,
      provide: { name: '' },
      createDate: Date.now(),
      updateDate: Date.now(),
      remark: '',
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item';
    },
    tabaleDateProcessed() {
      this.tableData.map(e => {
        e.quantityLowerLimit = e.quantityLowerLimit == 0 ? '无' : e.quantityLowerLimit;
        e.quantityUpperLimit = e.quantityUpperLimit ? e.quantityUpperLimit : '无';
        return e;
      }).filter(e => {
        e.Status != -1;
      });
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  created() {
    this.initialize();
  },

  methods: {
    hasError(res) {
      return res.errors.length && res.errors.length > 0;
    },
    initialize() {
      this.$http.request({ method: 'get', url: '/api/commodity/findCommodityByPage', data: {} }).then(res => {
        if (this.hasError(res)) {
          this.$message.error('数据获取失败！请检查网络状态！');
        }
      });
    },

    editItem(item) {
      this.editedIndex = this.tableDataProcessed.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.tableDataProcessed.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      this.$http.request({
        method: 'delete',
        url: '/api/comodity/deleteCommodityById',
        params: { commodityId: this.editedItem.commodityId },
      }).then(res => {
        if (this.hasError(res)) {
          this.$message.error('删除失败！该商品不存在或无法删除！');
        } else {
          this.$message.success('删除成功！');
        }
      });
      this.tableDataProcessed.splice(this.editedIndex, 1);
      this.closeDelete();
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.tableDataProcessed[this.editedIndex], this.editedItem);
      } else {
        this.tableDataProcessed.push(this.editedItem);
      }
      this.close();
    },
  },
};
</script>