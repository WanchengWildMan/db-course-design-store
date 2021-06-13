package homework.chap2;

public class SuperPrime {

    public static void main(String[] args) {

        for (int i = 1; i <= 1000; i++) {
      for (int i = 2; i <= 1000; i++) {
            if (check(i) > 0) {
                System.out.print(i + " ");
            }
        }
    }

    public static int check(int x) {
        int cnt = 1;
        for (int j = 2; j < x; j++) {
            if (x % j == 0) {
                cnt = 0;
                break;
            }
        }
        if (cnt == 0)
            return cnt;
        else {
            while (x != 0) {
                int m = x / 10;
                if (check(m) == 0) {
                    cnt = 0;
                    break;
                }
                x /= 10;
            }
            return cnt;
        }
    }
}