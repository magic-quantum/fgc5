{
    'name': "Custom Logo in Bill of Point Of Sale",
    'name_vi_VN': "Logo Tùy chỉnh trong Hóa Đơn của Điểm Bán hàng",
    'summary': """
Custom Logo in Bill of Point Of Sale
         """,
    'summary_vi_VN': """
Logo Tùy chỉnh trong Hóa Đơn của Điểm Bán hàng
         """,
    'description': """

What it does
============

#. Problem

The logo of a store is often designed to represent the values and message that the store wants to convey to its customers. A logo typically includes elements such as imagery, color, and font to create a unique and recognizable symbol.

However, the unique characteristics of color can be a barrier with thermal printers used to print receipts for customers. Logos printed from thermal printers do not guarantee sharpness for logos that use cool colors or cannot show the contrast between warm color schemes.

#. Solution

Create a module to add a logo or text to replace the default logo of a store or company. This will help to ensure that the logo printed on receipts is sharper and clearer.

Editions Supported
==================
1. Community Edition
2. Enterprise Edition

    """,
    'description_vi_VN': """
Mô tả
=====

#. Vấn đề

Logo của một cửa hàng thường được thiết kế để thể hiện những giá trị và thông điệp mà cửa hàng muốn truyền tải đến khách hàng. Logo thường bao gồm các yếu tố như hình ảnh, màu sắc và font chữ để tạo nên một biểu tượng độc đáo và dễ nhận diện.

Nhưng do các đặc tính về màu sắc độc đáo lại là rào cản với máy in nhiệt được sử dụng để in hóa đơn cho khách hàng. Logo được in từ máy in nhiệt không đảm bảo độ sắc nét đối với các logo sử dụng các gam màu lạnh hoặc không thể hiện được tính tương phản giữa các gam màu nóng.

#. Giải pháp

Tạo ra một module để thêm vào một logo hoặc văn bản thay thế logo mặc định của cửa hàng, công ty. Giúp việc in logo trên hóa đơn được sắc nét và rõ ràng hơn

Ấn bản được hỗ trợ
==================
1. Ấn bản Community
2. Ấn bản Enterprise

    """,

    'author': "T.V.T Marine Automation (aka TVTMA),Viindoo",
    'website': 'https://viindoo.com/apps/app/16.0/viin_pos_custom_bill_logo',
    'live_test_url': "https://v16demo-int.viindoo.com",
    'live_test_url_vi_VN': "https://v16demo-vn.viindoo.com",
    'demo_video_url': "",
    'support': 'apps.support@viindoo.com',
    'category': 'Point Of Sale',
    'version': '0.1.0',

    # any module necessary for this one to work correctly
    'depends': ['point_of_sale'],

    # always loaded
    'data': [
        'views/res_config_setting.xml',
    ],
    'assets': {
        'point_of_sale.assets': [
            'viin_pos_custom_bill_logo/static/src/js/**/*.js',
            'viin_pos_custom_bill_logo/static/src/xml/Screens/ReceiptScreen/OrderReceipt.xml',
        ],
    },

    'installable': True,
    'application': False,
    'auto_install': True,
    'price': 0.0,
    'currency': 'EUR',
    'license': 'OPL-1',
    'post_init_hook': '_pos_config_post_init',
}
