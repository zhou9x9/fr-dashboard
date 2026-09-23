# FR 业务分析看板

这个文件夹可以直接分享给别人使用。

## 直接看当前样例

1. 直接双击打开 `index.html`
2. 页面会读取同目录下的 `app.js` 和 `data.js`

## 替换成自己的新数据

1. 把两份 CSV 放到 `input/` 目录
2. 建议文件名分别使用：
   - `common.csv`
   - `timing.csv`
3. 运行：

```bash
python3 build_dashboard_data.py --common input/common.csv --timing input/timing.csv --output data.js
```

4. 重新打开 `index.html`

## 文件说明

- `index.html`：看板页面
- `app.js`：页面交互和图表逻辑
- `data.js`：当前样例数据
- `build_dashboard_data.py`：把两份 CSV 转成 `data.js`
- `input/`：放新的 CSV 数据

## 数据要求

主表 CSV 需要包含这些维度列：

- `报表日期`
- `项目代号`
- `首次访问日期`
- `国家`
- `版本号`

通知时机 CSV 需要包含这些维度列：

- `报表日期`
- `项目代号`
- `首次访问日期`
- `国家`
- `版本` 或 `版本号`
- `通知时机`

说明：

- 百分比字段可以是 `12.34%`
- 数值字段可以是普通数字
- 脚本会把率类字段转成小数口径供页面计算
