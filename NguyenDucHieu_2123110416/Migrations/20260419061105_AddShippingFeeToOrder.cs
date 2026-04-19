using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NguyenDucHieu_2123110416.Migrations
{
    /// <inheritdoc />
    public partial class AddShippingFeeToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ShippingFee",
                table: "Orders",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.UpdateData(
                table: "Banners",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830));

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "ExpiryDate" },
                values: new object[] { new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830), new DateTime(2026, 5, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830) });

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "ExpiryDate" },
                values: new object[] { new DateTime(2026, 4, 19, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830), new DateTime(2026, 5, 4, 13, 11, 2, 288, DateTimeKind.Local).AddTicks(1830) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShippingFee",
                table: "Orders");

            migrationBuilder.UpdateData(
                table: "Banners",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 14, 44, 43, 366, DateTimeKind.Local).AddTicks(72));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 14, 44, 43, 366, DateTimeKind.Local).AddTicks(72));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 14, 44, 43, 366, DateTimeKind.Local).AddTicks(72));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 14, 44, 43, 366, DateTimeKind.Local).AddTicks(72));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 14, 44, 43, 366, DateTimeKind.Local).AddTicks(72));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 14, 44, 43, 366, DateTimeKind.Local).AddTicks(72));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 14, 44, 43, 366, DateTimeKind.Local).AddTicks(72));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 14, 44, 43, 366, DateTimeKind.Local).AddTicks(72));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 14, 44, 43, 366, DateTimeKind.Local).AddTicks(72));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 14, 44, 43, 366, DateTimeKind.Local).AddTicks(72));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 14, 44, 43, 366, DateTimeKind.Local).AddTicks(72));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 14, 44, 43, 366, DateTimeKind.Local).AddTicks(72));

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "ExpiryDate" },
                values: new object[] { new DateTime(2026, 4, 18, 14, 44, 43, 366, DateTimeKind.Local).AddTicks(72), new DateTime(2026, 5, 18, 14, 44, 43, 366, DateTimeKind.Local).AddTicks(72) });

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "ExpiryDate" },
                values: new object[] { new DateTime(2026, 4, 18, 14, 44, 43, 366, DateTimeKind.Local).AddTicks(72), new DateTime(2026, 5, 3, 14, 44, 43, 366, DateTimeKind.Local).AddTicks(72) });
        }
    }
}
